import * as vscode from 'vscode'
import { IconSnagPanel } from './webview'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('iconsnag.open', () => {
      IconSnagPanel.createOrShow(context)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('iconsnag.insertRecent', async () => {
      const recentIcons: RecentIcon[] = context.workspaceState.get('iconsnag.recent', [])
      if (recentIcons.length === 0) {
        vscode.window.showInformationMessage('No recent icons. Open IconSnag to search for icons first.')
        return
      }

      const items = recentIcons.map((icon) => ({
        label: icon.name,
        description: `${icon.source} · ${icon.style}`,
        icon,
      }))

      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a recently used icon',
      })

      if (picked) {
        // Open the panel with the selected icon
        const panel = IconSnagPanel.createOrShow(context)
        panel.postToWebview({ type: 'selectIcon', icon: picked.icon })
      }
    })
  )
}

export function deactivate() {}

interface RecentIcon {
  id: string
  name: string
  source: string
  style: string
}
