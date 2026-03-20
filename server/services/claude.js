const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

async function callClaude({ system, messages, model = 'claude-sonnet-4-20250514', max_tokens = 1000 }) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('API key not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens, system, messages }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Anthropic API error: ${response.status}`)
  }

  return response.json()
}

function extractText(response) {
  return response.content?.map(b => b.text || '').join('') || ''
}

module.exports = { callClaude, extractText }
