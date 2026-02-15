import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

export class IconSnagPanel {
  public static currentPanel: IconSnagPanel | undefined
  private static readonly viewType = 'iconsnag'

  private readonly panel: vscode.WebviewPanel
  private readonly extensionUri: vscode.Uri
  private readonly context: vscode.ExtensionContext
  private disposables: vscode.Disposable[] = []

  public static createOrShow(context: vscode.ExtensionContext): IconSnagPanel {
    const column = vscode.ViewColumn.Beside

    if (IconSnagPanel.currentPanel) {
      IconSnagPanel.currentPanel.panel.reveal(column)
      return IconSnagPanel.currentPanel
    }

    const panel = vscode.window.createWebviewPanel(
      IconSnagPanel.viewType,
      'IconSnag',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'webview-ui', 'dist'),
          vscode.Uri.joinPath(context.extensionUri, 'data'),
        ],
      }
    )

    IconSnagPanel.currentPanel = new IconSnagPanel(panel, context)
    return IconSnagPanel.currentPanel
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this.panel = panel
    this.context = context
    this.extensionUri = context.extensionUri

    this.panel.webview.html = this.getHtmlForWebview()

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)

    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessage(message),
      null,
      this.disposables
    )

    // Send recent icons when panel opens
    const recentIcons = context.workspaceState.get('iconsnag.recent', [])
    this.postToWebview({ type: 'recentIcons', icons: recentIcons })
  }

  public postToWebview(message: unknown) {
    this.panel.webview.postMessage(message)
  }

  private async handleMessage(message: { type: string; [key: string]: unknown }) {
    switch (message.type) {
      case 'insertSvg':
        await this.insertTextAtCursor(message.svgContent as string)
        this.postToWebview({ type: 'actionResult', success: true, message: 'SVG inserted' })
        break

      case 'insertImg':
        const imgTag = `<img src="${message.url}" alt="${message.alt}" width="${message.size}" height="${message.size}" />`
        await this.insertTextAtCursor(imgTag)
        this.postToWebview({ type: 'actionResult', success: true, message: 'Image tag inserted' })
        break

      case 'copySvg':
        await vscode.env.clipboard.writeText(message.svgContent as string)
        this.postToWebview({ type: 'actionResult', success: true, message: 'SVG copied to clipboard' })
        break

      case 'copyGlyph':
        await vscode.env.clipboard.writeText(message.glyph as string)
        this.postToWebview({ type: 'actionResult', success: true, message: 'Emoji copied to clipboard' })
        break

      case 'saveFile': {
        const defaultUri = vscode.workspace.workspaceFolders?.[0]?.uri
        const uri = await vscode.window.showSaveDialog({
          defaultUri: defaultUri ? vscode.Uri.joinPath(defaultUri, message.fileName as string) : undefined,
          filters: { 'SVG files': ['svg'] },
        })
        if (uri) {
          await vscode.workspace.fs.writeFile(uri, Buffer.from(message.svgContent as string, 'utf-8'))
          this.postToWebview({ type: 'actionResult', success: true, message: `Saved to ${path.basename(uri.fsPath)}` })
        }
        break
      }

      case 'trackRecent': {
        const icon = message.icon as { id: string; name: string; source: string; style: string }
        const config = vscode.workspace.getConfiguration('iconsnag')
        const maxRecent = config.get<number>('recentCount', 20)
        const recent: typeof icon[] = this.context.workspaceState.get('iconsnag.recent', [])
        const filtered = recent.filter((r) => r.id !== icon.id || r.source !== icon.source)
        filtered.unshift(icon)
        await this.context.workspaceState.update('iconsnag.recent', filtered.slice(0, maxRecent))
        break
      }

      case 'getDataUri': {
        const fileName = message.fileName as string
        const dataPath = vscode.Uri.joinPath(this.extensionUri, 'data', fileName)
        const webviewUri = this.panel.webview.asWebviewUri(dataPath)
        this.postToWebview({ type: 'dataUri', fileName, uri: webviewUri.toString() })
        break
      }
    }
  }

  private async insertTextAtCursor(text: string) {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showWarningMessage('No active editor. Open a file first.')
      return
    }

    await editor.edit((editBuilder) => {
      if (editor.selection.isEmpty) {
        editBuilder.insert(editor.selection.active, text)
      } else {
        editBuilder.replace(editor.selection, text)
      }
    })
  }

  private getHtmlForWebview(): string {
    const webview = this.panel.webview
    const distPath = vscode.Uri.joinPath(this.extensionUri, 'webview-ui', 'dist')

    // Read the built index.html from the webview-ui dist
    const indexPath = path.join(distPath.fsPath, 'index.html')

    let html: string
    try {
      html = fs.readFileSync(indexPath, 'utf-8')
    } catch {
      return `<!DOCTYPE html>
<html>
<body>
  <h2>IconSnag webview not built</h2>
  <p>Run <code>npm run build:webview</code> in <code>packages/vscode/</code> first.</p>
</body>
</html>`
    }

    // Convert relative paths to webview URIs
    const distUri = webview.asWebviewUri(distPath)
    html = html.replace(/(href|src)="\.?\/?/g, `$1="${distUri}/`)

    // Build data URIs for index files
    const dataFiles = [
      'fluent-emoji-index.json',
      'material-symbols-index.json',
      'noto-emoji-index.json',
      'tabler-icons-index.json',
      'fluent-icons-index.json',
      'lucide-index.json',
      'phosphor-index.json',
      'bootstrap-icons-index.json',
    ]

    const dataUris: Record<string, string> = {}
    for (const file of dataFiles) {
      const dataPath = vscode.Uri.joinPath(this.extensionUri, 'data', file)
      dataUris[file] = webview.asWebviewUri(dataPath).toString()
    }

    // Inject data URIs and CSP
    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src ${webview.cspSource} 'unsafe-inline'`,
      `img-src ${webview.cspSource} https: data:`,
      `font-src ${webview.cspSource}`,
      `connect-src ${webview.cspSource} https:`,
    ].join('; ')

    html = html.replace(
      '</head>',
      `<meta http-equiv="Content-Security-Policy" content="${csp}">
<script>window.__ICONSNAG_DATA_URIS__ = ${JSON.stringify(dataUris)};</script>
</head>`
    )

    return html
  }

  private dispose() {
    IconSnagPanel.currentPanel = undefined
    this.panel.dispose()
    while (this.disposables.length) {
      const d = this.disposables.pop()
      if (d) d.dispose()
    }
  }
}
