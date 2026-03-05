#!/bin/bash
# 一键安装 md-to-pdf skill

set -e

INSTALL_DIR="$HOME/.claude/skills/md-to-pdf"
REPO_URL="https://github.com/OrangeBorning/md-to-pdf-skill.git"

echo "📦 正在安装 md-to-pdf skill..."

# 创建目录
mkdir -p "$INSTALL_DIR"

# 克隆仓库
if [ -d "$INSTALL_DIR/.git" ]; then
    echo "📁 已存在，更新中..."
    cd "$INSTALL_DIR" && git pull
else
    echo "📥 克隆仓库..."
    git clone "$REPO_URL" "$INSTALL_DIR"
fi

# 安装依赖
echo "📚 安装依赖..."
cd "$INSTALL_DIR"
npm install > /dev/null 2>&1

echo "✅ 安装完成！"
echo ""
echo "使用方法："
echo "  在 Claude Code 中说: 请把这个文件转成 PDF"
echo "  或命令行: ~/.claude/skills/md-to-pdf/md2pdf.sh input.md"
