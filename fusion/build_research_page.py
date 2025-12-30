import os

# Define the HTML parts
head_part = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>深入研究 - 人造太阳：核聚变主流技术路线全景</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']]
          }
        };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
    <style>
        .research-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #e0e0e0;
            background: rgba(10, 15, 30, 0.8);
            border-radius: 10px;
            margin-top: 40px;
            margin-bottom: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .research-container h1 {
            color: #00f3ff;
            text-align: center;
            margin-bottom: 40px;
            font-size: 2.5em;
            text-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
        }
        .research-container h2 {
            color: #ff0055;
            margin-top: 40px;
            border-bottom: 1px solid #333;
            padding-bottom: 10px;
        }
        .research-container h3 {
            color: #ffd700;
            margin-top: 30px;
        }
        .research-container h4 {
            color: #00f3ff;
            margin-top: 25px;
            font-size: 1.2em;
        }
        .research-container p {
            line-height: 1.8;
            margin-bottom: 20px;
            font-size: 1.1em;
            color: #ccc;
        }
        .research-container ul, .research-container ol {
            margin-left: 20px;
            margin-bottom: 20px;
        }
        .research-container li {
            margin-bottom: 10px;
            line-height: 1.6;
        }
        .research-container strong {
            color: #fff;
        }
    </style>
</head>
<body>
    <!-- 导航栏 -->
    <nav>
        <div class="logo">⚛️ 罗博士看核聚变</div>
        <div class="nav-links">
            <a href="index.html#principles">基本原理</a>
            <a href="index.html#triple-product">聚变三重积</a>
            <a href="index.html#routes">技术路线</a>
            <a href="research.html" class="active">罗博深度</a>
        </div>
    </nav>

    <div class="research-container">
"""

foot_part = """
    </div>
</body>
</html>
"""

# Read body content
with open('research_body.html', 'r', encoding='utf-8') as f:
    body_content = f.read()

# Assemble
full_html = head_part + body_content + foot_part

# Write to research.html
with open('research.html', 'w', encoding='utf-8') as f:
    f.write(full_html)

print("research.html has been successfully rebuilt.")
