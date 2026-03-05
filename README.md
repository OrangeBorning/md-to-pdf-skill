# Markdown to PDF Skill for Claude Code

将 Markdown 文件转换为 PDF，完美支持中文、Mermaid 图表和颜色保留。

## 功能特点

| 特性 | 说明 |
|------|------|
| 中文字体 | ✅ 使用 STHeiti、PingFang SC 等系统字体 |
| Mermaid 图表 | ✅ 自动渲染为 SVG |
| 颜色保留 | ✅ 打印时保持原色 |
| 分页控制 | ✅ 标题避免分页断裂 |
| A4 格式 | ✅ 1.5cm 边距 |

## 安装

**一键安装**（推荐）：
```bash
curl -sSL https://raw.githubusercontent.com/OrangeBorning/md-to-pdf-skill/main/install.sh | bash
```

**手动安装**：
```bash
cd ~/.claude/skills
git clone https://github.com/OrangeBorning/md-to-pdf-skill.git md-to-pdf
cd md-to-pdf && npm install
```

## 使用方法

在 Claude Code 中直接使用：

```
请把这个文件转成 PDF：/path/to/file.md
```

或命令行直接调用：

```bash
# 使用包装脚本
~/.claude/skills/md-to-pdf/md2pdf.sh input.md [output.pdf]

# 使用 Node.js
node ~/.claude/skills/md-to-pdf/md2pdf.js input.md output.pdf
```

## 工作原理

```
MD File → HTML (marked) → Browser (Puppeteer) → Wait for Mermaid → PDF
```

## 依赖

- [puppeteer](https://github.com/puppeteer/puppeteer) - 无头浏览器
- [marked](https://github.com/markedjs/marked) - Markdown 解析器

## License

MIT
