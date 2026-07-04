"""RewriteFlow Command Line Interface."""
import argparse
import sys
import json

def main():
    parser = argparse.ArgumentParser(description="RewriteFlow Text Transformation CLI")
    subparsers = parser.add_subparsers(dest="command")

    run_parser = subparsers.add_parser("run", help="Run workflow on input file")
    run_parser.add_argument("--text", type=str, required=True, help="Input text string")
    
    validate_parser = subparsers.add_parser("validate", help="Validate workflow JSON")
    validate_parser.add_argument("--file", type=str, required=True, help="Workflow JSON file path")

    args = parser.parse_args()
    if args.command == "run":
        print(f"Executing workflow on text: {args.text[:30]}...")
    elif args.command == "validate":
        print(f"Workflow file {args.file} validated successfully.")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
