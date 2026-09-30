"""RewriteFlow command-line interface.

    python -m engine steps
    python -m engine presets
    python -m engine validate my-workflow.yaml
    python -m engine analyze original.md rewritten.md
    python -m engine run --workflow email_polish drafts/ --out polished/
    python -m engine run --mode simplified --length shorter notes.txt
    echo "some text" | python -m engine run --steps grammar,concise -
"""
import argparse
import json
import sys
from typing import List, Optional

from engine.batch import collect_files, process_files
from engine.library import load_library
from engine.llm import GroqClient
from engine.metrics.report import build_report
from engine.nodes.hallucination import FACT_LABELS
from engine.parser import WorkflowError, list_presets, load_workflow, validate_workflow
from engine.plugins.loader import PluginError, register_plugin
from engine.prompts.builder import build_mode_prompt, build_workflow_prompt
from engine.runner import rewrite_document
from engine.telemetry import RunLog
from engine.text import normalize_text


def make_client() -> GroqClient:
    """Factory for the LLM client (tests replace this)."""
    return GroqClient()


def _err(msg: str):
    print(f"error: {msg}", file=sys.stderr)


def _describe_issues(report) -> str:
    n = report["issues"]
    return "details preserved" if not n else f"{n} detail{'s' if n != 1 else ''} to check"


# ── commands ───────────────────────────────────────────────────


def cmd_steps(args) -> int:
    library = load_library()
    print("Modes (use with --mode):")
    for key, mode in library["modes"].items():
        print(f"  {key:<12} {mode['label']}")
    print("\nSteps (use in workflows or with --steps):")
    for step in library["steps"]:
        params = ", ".join(f"{k}={v['default']}" for k, v in (step.get("params") or {}).items())
        print(f"  {step['id']:<12} {step['description']}" + (f"  [params: {params}]" if params else ""))
    print("\nOptions: --length " + "|".join(library["options"]["length"]) + "  --formality " + "|".join(library["options"]["formality"]))
    return 0


def cmd_presets(args) -> int:
    for name, path in list_presets().items():
        wf = load_workflow(path)
        print(f"  {name:<24} {wf['name']}: {' → '.join(s['id'] for s in wf['steps'])}")
    return 0


def cmd_validate(args) -> int:
    failed = 0
    for path in args.files:
        try:
            wf = load_workflow(path)
            print(f"ok     {path}  ({wf['name']}, {len(wf['steps'])} step(s))")
        except WorkflowError as err:
            failed += 1
            print(f"error  {path}: {err}")
    return 1 if failed else 0


def cmd_analyze(args) -> int:
    with open(args.original, encoding="utf-8") as f:
        original = normalize_text(f.read())
    with open(args.rewritten, encoding="utf-8") as f:
        rewritten = normalize_text(f.read())
    report = build_report(original, rewritten)
    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
        return 0
    _print_report(report)
    return 0


def _print_report(report):
    r = report["readability"]
    b, a = r["before"], r["after"]
    print(f"Words            {b['words']} → {a['words']}")
    print(f"Grade level      {b['fleschKincaidGrade']} → {a['fleschKincaidGrade']}")
    print(f"Reading ease     {b['fleschReadingEase']} ({r['ease_before']}) → {a['fleschReadingEase']} ({r['ease_after']})")
    print(f"Avg sentence     {b['avgSentenceLength']} → {a['avgSentenceLength']} words")
    print(f"Content overlap  {report['content_overlap']:.0%}")
    m = report["meaning_check"]
    print(f"Meaning check    {_describe_issues(report)} (checked {m['checked']})")
    for label, facts in (("missing", m["missing"]), ("added", m["added"])):
        for fact in facts:
            print(f"  {label:<8} {FACT_LABELS[fact['type']]:<9} {fact['value']}")


def _system_prompt(args):
    options = {"length": args.length, "formality": args.formality}
    chosen = [x for x in (args.mode, args.workflow, args.steps or args.instruction) if x]
    if len(chosen) > 1:
        raise WorkflowError("Use only one of --mode, --workflow or --steps/--instruction")
    if args.workflow:
        wf = load_workflow(args.workflow)
        return build_workflow_prompt(wf, options), {"workflow": wf["name"]}, wf["post"]
    if args.steps or args.instruction:
        steps = []
        for sid in filter(None, (args.steps or "").split(",")):
            steps.append({"id": sid.strip()})
        for p in args.param:
            key, _, value = p.partition("=")
            sid, _, name = key.partition(".")
            match = next((s for s in steps if s["id"] == sid), None)
            if not match or not name or not value:
                raise WorkflowError(f"--param {p}: expected STEP.NAME=VALUE for a step in --steps")
            match.setdefault("params", {})[name] = value
        wf = validate_workflow({"name": "Custom workflow", "steps": steps, "custom_instruction": args.instruction})
        return build_workflow_prompt(wf, options), {"steps": [s["id"] for s in wf["steps"]]}, []
    mode = args.mode or "standard"
    return build_mode_prompt(mode, options), {"mode": mode}, []


def cmd_run(args) -> int:
    try:
        for spec in args.plugin:
            register_plugin(spec)
        system, source, post = _system_prompt(args)
        post = post + args.post
    except (WorkflowError, PluginError, ValueError) as err:
        _err(str(err))
        return 2

    stdin_mode = args.inputs == ["-"]
    if args.dry_run:
        print(system)
        return 0

    try:
        llm = make_client()
        if stdin_mode:
            text = normalize_text(sys.stdin.read())
            if not text.strip():
                _err("stdin is empty")
                return 2
            done = rewrite_document(text, system, llm, post)
            sys.stdout.write(done["output"].rstrip("\n") + "\n")
            if not args.quiet:
                print(f"[{_describe_issues(done['report'])}]", file=sys.stderr)
            return 0

        files = collect_files(args.inputs)
    except FileNotFoundError as err:
        _err(str(err))
        return 2
    except Exception as err:  # noqa: BLE001 - surface API errors cleanly for stdin mode
        _err(str(err))
        return 1

    if not files:
        _err("no .txt or .md files found")
        return 2

    log = RunLog(source)

    def on_event(kind, info):
        if args.quiet:
            return
        tag = f"[{info['index']}/{info['total']}] {info['source']}"
        if kind == "start":
            print(f"{tag} …", file=sys.stderr)
        elif kind == "done":
            print(f"{tag} → {info['output_path']} ({info['paragraphs']} paragraph(s), {_describe_issues(info['report'])})", file=sys.stderr)
        else:
            print(f"{tag} failed: {info['error']}", file=sys.stderr)

    results = process_files(files, system, llm, args.out, post=post, workers=args.workers, on_event=on_event)
    for r in results:
        log.add(r)
    if args.report:
        log.write(args.report)
    summary = log.to_dict()["summary"]
    if not args.quiet:
        print(f"Done: {summary['ok']} rewritten, {summary['failed']} failed, {summary['details_to_check']} detail(s) to check.", file=sys.stderr)
    return 1 if summary["failed"] else 0


# ── argument parsing ───────────────────────────────────────────


def build_parser() -> argparse.ArgumentParser:
    library = load_library()
    parser = argparse.ArgumentParser(prog="python -m engine", description="RewriteFlow: rewrite text files with Groq using modes and workflows.")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("steps", help="List modes, steps and options").set_defaults(func=cmd_steps)
    sub.add_parser("presets", help="List starter workflows").set_defaults(func=cmd_presets)

    p = sub.add_parser("validate", help="Check workflow files")
    p.add_argument("files", nargs="+")
    p.set_defaults(func=cmd_validate)

    p = sub.add_parser("analyze", help="Compare an original and a rewrite (readability + meaning check)")
    p.add_argument("original")
    p.add_argument("rewritten")
    p.add_argument("--json", action="store_true", help="Print the report as JSON")
    p.set_defaults(func=cmd_analyze)

    p = sub.add_parser("run", help="Rewrite files, folders or stdin ('-')")
    p.add_argument("inputs", nargs="+", help=".txt/.md files, folders, or - for stdin")
    src = p.add_argument_group("instructions (pick one; default --mode standard)")
    src.add_argument("--mode", choices=list(library["modes"]))
    src.add_argument("--workflow", help="Preset name (see `presets`) or a .yaml/.json file")
    src.add_argument("--steps", help="Comma-separated step ids, e.g. grammar,concise")
    src.add_argument("--param", action="append", default=[], metavar="STEP.NAME=VALUE", help="Step parameter, e.g. translate.lang=French")
    src.add_argument("--instruction", help="Custom instruction (alone or with --steps)")
    p.add_argument("--length", choices=list(library["options"]["length"]), default="same")
    p.add_argument("--formality", choices=list(library["options"]["formality"]), default="neutral")
    p.add_argument("--out", default="rewritten", help="Output folder (default: ./rewritten)")
    p.add_argument("--post", action="append", default=[], help="Extra local post-processing node, e.g. tidy_markdown")
    p.add_argument("--plugin", action="append", default=[], metavar="FILE.py:Class", help="Load a custom post-processing node")
    p.add_argument("--workers", type=int, default=1, help="Files to process in parallel (default 1)")
    p.add_argument("--report", help="Write a JSON report of the run to this file")
    p.add_argument("--dry-run", action="store_true", help="Print the system prompt and exit without calling the API")
    p.add_argument("--quiet", action="store_true", help="No progress output")
    p.set_defaults(func=cmd_run)
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
