export async function postChat(name: string, color: string, message: string): Promise<void> {
  const res = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color, message }),
  })
  if (!res.ok) throw new Error('メッセージの送信に失敗しました')
}
