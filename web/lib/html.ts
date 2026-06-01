const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
}

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => HTML_ESCAPES[c])
}
