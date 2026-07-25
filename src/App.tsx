import { useCallback, useState } from 'react'
import { Conversation } from './components/cvi/components/conversation'
import { CVIProvider } from './components/cvi/components/cvi-provider'
import './App.css'

type ConversationResponse = {
  conversation_url?: string
  message?: string
  error?: string
}

function App() {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createConversation = async () => {
    setIsStarting(true)
    setError(null)

    try {
      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_TAVUS_API_KEY || '',
        },
        body: JSON.stringify({
          face_id: import.meta.env.VITE_REPLICA_ID || 'r90bbd427f71',
          pal_id: import.meta.env.VITE_PERSONA_ID || 'pcb7a34da5fe',
        }),
      })

      const data = (await response.json()) as ConversationResponse

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `Tavus request failed (${response.status})`,
        )
      }

      if (!data.conversation_url) {
        throw new Error('Tavus did not return a conversation URL.')
      }

      setConversationUrl(data.conversation_url)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to start the conversation.',
      )
    } finally {
      setIsStarting(false)
    }
  }

  const handleLeave = useCallback(() => {
    setConversationUrl(null)
  }, [])

  return (
    <CVIProvider>
      <main className={conversationUrl ? 'app app--in-call' : 'app'}>
        {conversationUrl ? (
          <section className="conversation-shell" aria-label="Tavus conversation">
            <Conversation
              conversationUrl={conversationUrl}
              onLeave={handleLeave}
            />
          </section>
        ) : (
          <section className="welcome-card">
            <span className="eyebrow">Tavus CVI · Vite + React</span>
            <h1>Start a face-to-face conversation with AI.</h1>
            <p className="intro">
              Launch a live, responsive video session powered by Tavus
              Conversational Video Interface.
            </p>

            <button
              className="start-button"
              type="button"
              onClick={createConversation}
              disabled={isStarting}
            >
              {isStarting ? 'Creating conversation…' : 'Start conversation'}
            </button>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <p className="privacy-note">
              Camera and microphone access will be requested when the call starts.
            </p>
          </section>
        )}
      </main>
    </CVIProvider>
  )
}

export default App
