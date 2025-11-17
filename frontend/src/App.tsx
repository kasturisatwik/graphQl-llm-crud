import { useState } from 'react'
import axios from 'axios'
import './App.css'

interface Response {
  graphql : string;
  result: string;
}
function App() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'success' | 'fail' | null>(null)
  const [response, setResponse] = useState<Response | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!input.trim()) return

    setLoading(true)
    setStatus(null)
    setResponse(null)
    setError(null)

    try {
      const result = await axios.post('http://localhost:3000/gimmeSomething', {
        nl: input
      })
      setStatus('success')
      setResponse(result.data)

    } catch (err: unknown) {
      setStatus('fail')
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || 'An error occurred')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="container">
      <h1>Neo4j LLM chat</h1>
      
      <div className="input-section">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your natural language query..."
          disabled={loading}
        />
        <button onClick={handleSubmit} disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {status && (
        <div className={`status ${status}`}>
          {status === 'success' ? 'Success' : 'Failed'}
        </div>
      )}

      {status === 'success' && response && (
        <div className="response">
          <pre>{JSON.stringify(response.result, null, 1)}</pre>
        </div>
      )}

      {status === 'fail' && error && (
        <div className="error">
          {error}
        </div>
      )}
    </div>
  )
}

export default App
