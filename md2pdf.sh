#!/bin/bash
# Markdown to PDF Converter Wrapper
# Usage: md2pdf.sh input.md [output.pdf]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/md2pdf.js"

INPUT="$1"
OUTPUT="${2:-${INPUT%.md}.pdf}"

if [ ! -f "$INPUT" ]; then
  echo "Error: Input file '$INPUT' not found"
  exit 1
fi

echo "Converting: $INPUT -> $OUTPUT"
node "$NODE_SCRIPT" "$INPUT" "$OUTPUT"
