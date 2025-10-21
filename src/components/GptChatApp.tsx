import { useEffect, useState } from 'react'

type ChatRole = 'user' | 'assistant' | 'system'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

interface GptChatAppProps {
  isOpen: boolean
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
const openAiApiKey = import.meta.env.VITEOPENAI_API_KEY! ?? ''
const openAiModel = import.meta.env.VITE_OPENAI_MODEL! ?? 'gpt-3.5-turbo'

function GptChatApp({ isOpen }: GptChatAppProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log(openAiApiKey, openAiModel)

  useEffect(() => {
    if (!isOpen) {
      setMessages([])
      setInput('')
      setError(null)
      setIsLoading(false)
    }
  }, [isOpen])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmed,
    }

    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsLoading(true)

    if (!openAiApiKey) {
      const message = 'OpenAI APIキーが設定されていません。'
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: 'assistant', content: `エラー: ${message}` },
      ])
      setError(message)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: openAiModel,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message ?? 'OpenAI APIリクエストに失敗しました。')
      }

      const assistantContent =
        data.choices?.[0]?.message?.content?.trim() ?? '（応答がありませんでした）'

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: 'assistant', content: assistantContent },
      ])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '予期しないエラーが発生しました。'
      setError(message)
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: 'assistant', content: `エラー: ${message}` },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return
    if ((event.nativeEvent as any).isComposing) return

    const hasModifier = event.ctrlKey || event.metaKey
    if (hasModifier) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ margin: 0 }}>GptChatApp</h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxHeight: '40vh',
          overflowY: 'auto',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(0,0,0,0.05)',
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: message.role === 'user' ? '#2563eb' : '#111827',
              color: '#f9fafb',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              whiteSpace: 'pre-wrap',
              maxWidth: '80%',
            }}
          >
            {message.content}
          </div>
        ))}
        {messages.length === 0 && (
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            メッセージを入力して送信すると、会話がここに表示されます。
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="メッセージを入力してください"
          style={{
            resize: 'vertical',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.6 : 1,
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            {isLoading ? '送信中…' : 'Send'}
          </button>
          {error && (
            <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default GptChatApp
