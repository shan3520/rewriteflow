"""Rewrites many files, optionally in parallel, writing results to an output folder."""
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, Dict, Iterable, List, Optional, Tuple

from engine.runner import rewrite_document
from engine.text import normalize_text

TEXT_EXTS = (".txt", ".md", ".markdown")


def collect_files(paths: Iterable[str]) -> List[Tuple[str, str]]:
    """Expands files and folders into (source path, path relative to the output folder)."""
    found = []
    for path in paths:
        if os.path.isdir(path):
            for root, dirs, files in os.walk(path):
                dirs[:] = sorted(d for d in dirs if not d.startswith("."))
                for name in sorted(files):
                    if name.lower().endswith(TEXT_EXTS):
                        full = os.path.join(root, name)
                        found.append((full, os.path.relpath(full, path)))
        elif os.path.isfile(path):
            found.append((path, os.path.basename(path)))
        else:
            raise FileNotFoundError(f"No such file or folder: {path}")
    return found


def process_files(
    files: List[Tuple[str, str]],
    system: str,
    llm,
    out_dir: str,
    post: Iterable[str] = (),
    workers: int = 1,
    on_event: Optional[Callable[[str, Dict], None]] = None,
) -> List[Dict]:
    """Rewrites each file into out_dir. Returns one result dict per file, in input order.

    on_event(kind, info) is called with kind "start", "done" or "error".
    """
    post = list(post)
    emit = on_event or (lambda kind, info: None)

    def one(index_and_file):
        index, (src, rel) = index_and_file
        dest = os.path.join(out_dir, rel)
        info = {"index": index, "total": len(files), "source": src, "output_path": dest}
        if os.path.abspath(dest) == os.path.abspath(src):
            result = {**info, "status": "error", "error": "Output would overwrite the input; choose another --out folder"}
            emit("error", result)
            return result
        emit("start", info)
        try:
            with open(src, encoding="utf-8") as f:
                text = normalize_text(f.read())
            if not text.strip():
                raise ValueError("File is empty")
            done = rewrite_document(text, system, llm, post)
            os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
            with open(dest, "w", encoding="utf-8") as f:
                f.write(done["output"].rstrip("\n") + "\n")
            result = {**info, "status": "ok", "input_text": text, **done}
            emit("done", result)
        except Exception as err:  # noqa: BLE001 - report every failure per file and keep going
            result = {**info, "status": "error", "error": str(err)}
            emit("error", result)
        return result

    with ThreadPoolExecutor(max_workers=max(1, workers)) as pool:
        return list(pool.map(one, enumerate(files, 1)))
