import * as vscode from "vscode";
import { getAIcontent } from "./services";

export class WebViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this._getHtmlForWebview();
  }

  public async analyzeCode(code: string) {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Phân tích Code",
      },
      async () => {
        try {
          if (!this._view) {
            return;
          }

          const promt = `Bạn là một Senior Developer giàu kinh nghiệm. Hãy phân tích đoạn code sau và cung cấp đánh giá chi tiết:  

${code}  

### Yêu cầu:  
- Phân tích mã theo từng bước, chỉ ra cách hoạt động của từng phần.  
- Nếu có lỗi hoặc có thể tối ưu, hãy đề xuất cách cải thiện.  
- Cung cấp ví dụ code nếu cần thiết.  

### Định dạng câu trả lời:  
Trả lời dưới dạng một mảng JSON với cấu trúc sau:  
\`\`\`json
[
  {
    "title": "Tiêu đề bước 1",
    "content": "Giải thích chi tiết về bước 1, bao gồm chức năng của mã và các điểm cần lưu ý.",
    "codeKey": "Đoạn mã chính liên quan đến bước 1 (nếu có)"
  },
  {
    "title": "Tiêu đề bước 2",
    "content": "Giải thích chi tiết về bước 2, bao gồm chức năng của mã và các điểm cần lưu ý.",
    "codeKey": "Đoạn mã chính liên quan đến bước 2 (nếu có)"
  },
  ...
]`;

          const res = await getAIcontent(promt);

          type Result = {
            title: string;
            content: string;
            codeKey: string;
          };
          const jsonStartIndex = res.indexOf("[");
          const jsonEndIndex = res.lastIndexOf("]");
          const json = res.slice(jsonStartIndex, jsonEndIndex + 1);
          const result: Result[] = JSON.parse(json);

          this._view.webview.postMessage({
            command: "setResult",
            result,
          });
        } catch (error) {
          console.error(error);
          vscode.window.showErrorMessage(
            "Có lỗi xảy ra khi phân tích code" + error
          );
        }
      }
    );
  }

  private _getHtmlForWebview() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LTV Tech Talk</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f4f4f4;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        #ltv-tech-talk-result {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        ul {
            list-style: none;
            padding: 0;
        }
        .result-item {
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #fff;
            overflow: hidden;
        }
        .result-item h3 {
            margin: 0;
            padding: 12px;
            background: #007acc;
            color: white;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        .result-item h3:hover {
            background: #005f99;
        }
        .result-content {
            display: none;
            padding: 10px;
            border-top: 1px solid #ddd;
            background: #f9f9f9;
        }
        pre {
            background: #272822;
            color: #f8f8f2;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            font-family: "Courier New", monospace;
        }
    </style>
</head>
<body>
    <h1>Hello LTV Tech Talk</h1>
    <div id="ltv-tech-talk-result"></div>

    <script>
        const vscode = acquireVsCodeApi();

        window.addEventListener("message", (event) => {
            const message = event.data;

            if (message.command === "setResult") {
                const resultDiv = document.getElementById("ltv-tech-talk-result");
                resultDiv.innerHTML = "";
                const ul = document.createElement("ul");
                resultDiv.appendChild(ul);

                message.result.forEach((item) => {
                    const li = document.createElement("li");
                    li.classList.add("result-item");

                    // Tạo tiêu đề có thể click để mở rộng nội dung
                    const title = document.createElement("h3");
                    title.textContent = item.title;
                    li.appendChild(title);

                    // Tạo div chứa nội dung (ẩn mặc định)
                    const contentDiv = document.createElement("div");
                    contentDiv.classList.add("result-content");

                    // Thêm nội dung văn bản
                    const contentText = document.createElement("p");
                    contentText.textContent = item.content;
                    contentDiv.appendChild(contentText);

                    // Nếu có mã code, thêm vào nội dung
                    if (item.codeKey) {
                        const pre = document.createElement("pre");
                        const codeBlock = document.createElement("code");
                        codeBlock.textContent = item.codeKey;
                        pre.appendChild(codeBlock);
                        contentDiv.appendChild(pre);
                    }

                    li.appendChild(contentDiv);
                    ul.appendChild(li);

                    // Thêm sự kiện click để toggle nội dung
                    title.addEventListener("click", () => {
                        contentDiv.style.display = contentDiv.style.display === "block" ? "none" : "block";
                    });
                });
            }
        });
    </script>
</body>
</html>
`;
  }
}
