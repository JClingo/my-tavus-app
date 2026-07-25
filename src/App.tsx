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
          pal_id: import.meta.env.VITE_PERSONA_ID || 'pcde5abf91e4',
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
          <section
            className="conversation-shell"
            aria-label="Breathwork session with Vincent"
          >
            <Conversation
              conversationUrl={conversationUrl}
              onLeave={handleLeave}
            />
          </section>
        ) : (
          <section className="welcome" aria-labelledby="page-title">
            <header className="site-header">
              <a className="brand" href="/" aria-label="Still home">
                <span className="brand-mark" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                Still
              </a>
              <span className="session-length">About 5 minutes</span>
            </header>

            <div className="hero-content">
              <div className="guide-badge">
                <span className="guide-avatar" aria-hidden="true">V</span>
                <span>
                  <strong>Guided by Vincent</strong>
                  <small>Beginner breathwork facilitator</small>
                </span>
              </div>

              <p className="eyebrow">A little space to reset</p>
              <h1 id="page-title">Take a breath.<br />We’ll do the rest together.</h1>
              <p className="intro">
                Meet Vincent, your personal breathwork guide. He’ll walk you
                through a gentle box-breathing exercise at your pace—no
                experience needed.
              </p>

              <button
                className="start-button"
                type="button"
                onClick={createConversation}
                disabled={isStarting}
              >
                <span className="button-icon" aria-hidden="true">▶</span>
                {isStarting ? 'Preparing your session…' : 'Begin guided session'}
              </button>

              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}

              <ul className="session-details" aria-label="What to expect">
                <li>
                  <span aria-hidden="true">◌</span>
                  Live, one-to-one guidance
                </li>
                <li>
                  <span aria-hidden="true">♬</span>
                  Find a quiet, comfortable spot
                </li>
                <li>
                  <span aria-hidden="true">⌁</span>
                  Camera and microphone needed
                </li>
              </ul>

              <p className="safety-note">
                Breathwork is a wellbeing practice, not medical care. Stop if
                you feel dizzy, uncomfortable, or short of breath.
              </p>
            </div>
          </section>
        )}
      </main>
    </CVIProvider>
  )
}

export default App
