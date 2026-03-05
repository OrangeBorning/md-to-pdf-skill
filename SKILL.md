---
name: md-to-pdf
description: Use when converting Markdown files directly to PDF with proper Chinese fonts, Mermaid diagrams, and colors
---

# Markdown to PDF Converter

## Overview

Converts Markdown files to PDF using headless browser rendering with Puppeteer, ensuring:
- Chinese fonts display correctly
- Mermaid diagrams are fully rendered before PDF generation
- Colors are preserved in the PDF
- Proper pagination

## Quick Start

```bash
# Using wrapper script
~/.claude/skills/md-to-pdf/md2pdf.sh input.md [output.pdf]

# Using Node.js directly
node ~/.claude/skills/md-to-pdf/md2pdf.js input.md output.pdf
```

## Requirements

Install dependencies (one-time):
```bash
cd ~/.claude/skills/md-to-pdf
npm install puppeteer marked
```

## How It Works

```
MD File → HTML (marked) → Browser (Puppeteer) → Wait for Mermaid → PDF
```

1. **Parse MD** - Uses `marked` library to convert to HTML
2. **Format Mermaid** - Escapes content (`-->` → `--&gt;`)
3. **Load Page** - Puppeteer loads HTML with Mermaid from CDN
4. **Wait for Render** - Waits for `data-mermaid-done` attribute
5. **Generate PDF** - Outputs with `printBackground: true`

## Features

| Feature | Status |
|---------|--------|
| Chinese fonts | ✅ STHeiti, PingFang SC in print CSS |
| Mermaid diagrams | ✅ Rendered as SVG in PDF |
| Color printing | ✅ print-color-adjust: exact |
| Page breaks | ✅ h1-h6 page-break-after: avoid |
| A4 format | ✅ 1.5cm margins all sides |

## Example Output

```bash
$ node ~/.claude/skills/md-to-pdf/md2pdf.js guide.md
Found 71 Mermaid diagrams
[Browser] Mermaid loaded
[Browser] Starting mermaid render, diagrams: 71
[Browser] SVG count: 71
[OK] PDF saved to: guide.pdf (5.5MB)
```

## Troubleshooting

**Timeout errors**: Large files with many diagrams may take longer
- Increase `timeout` in `page.evaluate()` if needed
- Check console output for SVG count

**Mermaid not rendering**:
- Check if CDN is accessible from your network
- Look for `[Browser] Mermaid error` messages

**Chinese fonts not working**:
- Verify print CSS includes font-family with Chinese fonts
