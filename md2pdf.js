#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { marked } = require('marked');

// Configure marked
marked.use({
  extensions: [{
    name: 'mermaidCodeBlock',
    level: 'block',
    start(src) { return src.match(/^```mermaid\n/m)?.index; },
    tokenizer(src) {
      const match = src.match(/^```mermaid\n([\s\S]*?)```/);
      if (match) {
        return { type: 'mermaidCodeBlock', raw: match[0], code: match[1].trim() };
      }
    },
    renderer(token) {
      const escapedCode = token.code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<div class="mermaid">${escapedCode}</div>`;
    }
  }]
});

async function convertMarkdownToPdf(inputPath, outputPath, title) {
  const markdown = fs.readFileSync(inputPath, 'utf-8');
  const contentHtml = marked.parse(markdown);

  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const documentTitle = titleMatch ? titleMatch[1] : title;

  const mermaidCount = (markdown.match(/```mermaid/g) || []).length;
  console.log(`Found ${mermaidCount} Mermaid diagrams`);

  // Enhanced CSS with comprehensive font support
  const htmlTemplate = `<!DOCTYPE html><html><head>
  <title>${documentTitle}</title>
  <meta charset="utf-8">
  <style>
    /* Base styles - use actual installed font names */
    * {
      box-sizing: border-box;
    }
    html {
      font-family: "Hiragino Sans GB", "Heiti SC", "PingFang SC", "Microsoft YaHei", sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      max-width: 900px;
      margin: 0 auto;
      padding: 2em;
      font-family: "Hiragino Sans GB", "Heiti SC", "PingFang SC", "Microsoft YaHei", sans-serif;
    }
    /* Headings - use Heiti SC which is designed for UI/text */
    h1, h2, h3, h4, h5, h6 {
      line-height: 1.2;
      margin-top: 1em;
      margin-bottom: 16px;
      color: #000;
      font-weight: 600;
      font-family: "Heiti SC", "Hiragino Sans GB", "PingFang SC", "Microsoft YaHei", sans-serif !important;
    }
    h1 { font-size: 2.25em; font-weight: 300; padding-bottom: 0.3em; }
    h2 { font-size: 1.75em; font-weight: 400; padding-bottom: 0.3em; }
    h3 { font-size: 1.5em; font-weight: 500; }
    h4 { font-size: 1.25em; font-weight: 600; }
    h5 { font-size: 1.1em; font-weight: 600; }
    h6 { font-size: 1em; font-weight: 600; }
    /* Text elements - use exact font names */
    p, span, div, td, th, li, a, blockquote, strong, em, i, b {
      font-family: "Hiragino Sans GB", "Heiti SC", "PingFang SC", "Microsoft YaHei", sans-serif !important;
    }
    p { margin-top: 0; margin-bottom: 16px; }
    strong { color: #000; font-weight: 600; }
    em, i { font-style: italic; }
    a { color: #08c; text-decoration: none; }
    a:hover { color: #00a3f5; text-decoration: none; }
    /* Lists */
    ul, ol { padding-left: 2em; margin-bottom: 16px; }
    li { margin-bottom: 4px; }
    /* Blockquote */
    blockquote {
      margin: 16px 0;
      padding: 0 15px;
      color: #5c5c5c;
      background-color: #f0f0f0;
      border-left: 4px solid #d6d6d6;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important;
    }
    /* Horizontal rule */
    hr {
      height: 4px;
      margin: 32px 0;
      background-color: #d6d6d6;
      border: 0 none;
    }
    /* Tables */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important;
    }
    table th, table td {
      border: 1px solid #d6d6d6;
      padding: 6px 13px;
    }
    table th {
      background-color: #f2f2f2;
      font-weight: 700;
      color: #000;
    }
    /* Code */
    code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.85em;
      background-color: #f0f0f0;
      border-radius: 3px;
      padding: 0.2em 0.4em;
    }
    pre {
      padding: 1em;
      overflow: auto;
      line-height: 1.45;
      border: 1px solid #d6d6d6;
      border-radius: 3px;
      background-color: #f5f5f5;
    }
    pre code {
      background: 0 0;
      border: 0;
      padding: 0;
      color: inherit;
    }
    /* Mermaid diagrams */
    .mermaid {
      background: #fff;
      padding: 30px;
      border: 1px solid #eee;
      border-radius: 4px;
      margin: 30px 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: visible;
      display: block;
      min-height: 100px;
    }
    .mermaid svg {
      max-width: 100%;
      overflow: visible !important;
    }
    .mermaid text, .mermaid tspan {
      font-family: "Hiragino Sans GB", "Heiti SC", "PingFang SC", sans-serif !important;
    }
    .mermaid foreignObject {
      overflow: visible;
    }
    .mermaid foreignObject > div {
      display: inline-block;
      white-space: nowrap;
    }
    .mermaid .label {
      font-family: "Hiragino Sans GB", "Heiti SC", "PingFang SC", sans-serif !important;
    }
    .mermaid .nodeLabel, .mermaid .edgeLabel {
      font-family: "Hiragino Sans GB", "Heiti SC", "PingFang SC", sans-serif !important;
    }
    .mermaid .cluster-label {
      font-family: "Hiragino Sans GB", "Heiti SC", "PingFang SC", sans-serif !important;
    }

    /* Print-specific styles - use exact installed font names */
    @media print {
      /* Force Chinese fonts for everything */
      html, body, div, span, p, h1, h2, h3, h4, h5, h6,
      a, strong, em, i, b, ul, ol, li, blockquote,
      table, th, td, tr, code, pre, .mermaid, .markdown-preview {
        font-family: "Hiragino Sans GB", "Heiti SC", "PingFang SC", "Microsoft YaHei", sans-serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Page breaks */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
      }
      p, li, td, th, blockquote, pre, code {
        page-break-inside: avoid !important;
      }
      table, .mermaid, pre, blockquote {
        page-break-inside: avoid !important;
      }
      /* Images and diagrams */
      img, svg {
        max-width: 100% !important;
        height: auto !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Links */
      a {
        color: #000 !important;
        text-decoration: underline;
      }
      /* Mermaid text elements */
      .mermaid text, .mermaid tspan, .mermaid foreignObject, .mermaid g text, .mermaid rect {
        font-family: "Hiragino Sans GB", "Heiti SC", "PingFang SC", sans-serif !important;
      }
    }
  </style>
</head><body>
<div class="crossnote markdown-preview">
${contentHtml}
</div>
<script type="module">
    import mermaid from 'https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs';

    console.log('Mermaid loaded');

    // Initialize mermaid with proper config
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      fontFamily: '"Hiragino Sans GB", "Heiti SC", "PingFang SC", sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 25,
        nodeSpacing: 60,
        rankSpacing: 60,
        useMaxWidth: false
      },
      sequence: {
        actorMargin: 60,
        boxMargin: 15,
        boxTextMargin: 10,
        noteMargin: 15,
        messageMargin: 40,
        mirrorActors: true,
        useMaxWidth: false
      },
      gantt: {
        leftPadding: 80,
        gridLineStartPadding: 40,
        barHeight: 25,
        barGap: 6,
        topPadding: 60,
        useMaxWidth: false
      },
      mindmap: {
        padding: 15,
        useMaxWidth: false
      },
      pie: {
        textPosition: 0.75,
        useMaxWidth: false
      },
      er: {
        useMaxWidth: false
      },
      class: {
        useMaxWidth: false
      },
      state: {
        useMaxWidth: false
      }
    });

    function fixSvgSizing(svg) {
      // Force layout recalculation
      svg.style.display = 'block';
      svg.style.overflow = 'visible';

      // Get the actual bounding box of all content
      const bbox = svg.getBBox();

      // Add generous padding to prevent clipping
      const padding = 60;
      const x = Math.min(0, bbox.x - padding);
      const y = Math.min(0, bbox.y - padding);
      const width = Math.max(bbox.width + padding * 2, svg.clientWidth || bbox.width);
      const height = Math.max(bbox.height + padding * 2, svg.clientHeight || bbox.height);

      // Set viewBox to include all content with padding
      svg.setAttribute('viewBox', \`\${x} \${y} \${width} \${height}\`);
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);

      // Fix foreignObject elements (used for htmlLabels)
      svg.querySelectorAll('foreignObject').forEach(fo => {
        fo.style.overflow = 'visible';
        const foWidth = parseFloat(fo.getAttribute('width')) || 100;
        const foHeight = parseFloat(fo.getAttribute('height')) || 50;
        fo.setAttribute('width', foWidth + 20);
        fo.setAttribute('height', foHeight + 10);
      });

      console.log('Fixed SVG:', bbox.width, 'x', bbox.height, '->', width, 'x', height);
    }

    async function renderMermaid() {
      const diagrams = document.querySelectorAll('.mermaid');
      console.log('Starting mermaid render, diagrams:', diagrams.length);

      try {
        const result = await mermaid.run({ nodes: diagrams });
        console.log('Mermaid rendered:', result ? 'success' : 'no result');
      } catch(e) {
        console.error('Mermaid error:', e);
      }

      // Wait for layout to settle
      await new Promise(r => setTimeout(r, 1000));

      // Fix SVG sizing for all diagrams (always run this)
      const svgs = document.querySelectorAll('.mermaid svg');
      console.log('Found SVGs to fix:', svgs.length);

      svgs.forEach((svg, i) => {
        try {
          fixSvgSizing(svg);
        } catch(e) {
          console.error('Error fixing SVG', i, e);
        }
      });

      document.body.setAttribute('data-mermaid-done', 'true');
      console.log('SVG count:', svgs.length);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderMermaid);
    } else {
      renderMermaid();
    }
</script>
</body></html>`;

  console.log(`Converting ${inputPath} to ${outputPath}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => console.log(`[Browser] ${msg.text()}`));

    await page.setContent(htmlTemplate, {
      waitUntil: 'networkidle0',
      timeout: 120000
    });

    console.log('Waiting for Mermaid rendering...');
    await page.waitForFunction(
      () => document.body.getAttribute('data-mermaid-done') === 'true',
      { timeout: 60000 }
    );
    console.log('Mermaid rendering complete');

    // Wait for styles and fonts to settle
    await new Promise(r => setTimeout(r, 5000));

    // Generate PDF with enhanced settings
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
      printBackground: true,
      preferCSSPageSize: true
    });

    console.log(`[OK] PDF saved to: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

// CLI
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node md2pdf.js <input.md> [output.pdf]');
  process.exit(1);
}

const inputPath = args[0];
const outputPath = args[1] || inputPath.replace(/\.md$/i, '.pdf');

convertMarkdownToPdf(inputPath, outputPath).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
