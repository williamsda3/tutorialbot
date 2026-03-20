const fs = require('fs')
const path = require('path')
const { callClaude, extractText } = require('./claude')

const discoveryPrompt = fs.readFileSync(
  path.join(__dirname, '../../prompts/discovery.md'), 'utf-8'
)

const PROFILE_START = '|||PROFILE_COMPLETE|||'
const PROFILE_END = '|||END_PROFILE|||'

function parseProfileFromResponse(text) {
  const startIdx = text.indexOf(PROFILE_START)
  if (startIdx === -1) return { displayText: text, profileData: null }

  const endIdx = text.indexOf(PROFILE_END)
  const jsonStr = text.slice(startIdx + PROFILE_START.length, endIdx !== -1 ? endIdx : undefined).trim()
  const displayText = text.slice(0, startIdx).trim()

  try {
    const profileData = JSON.parse(jsonStr)
    return { displayText, profileData }
  } catch {
    // JSON parse failed — treat as no profile yet
    return { displayText: text, profileData: null }
  }
}

async function processMessage(userMessage, conversationHistory, exchangeCount) {
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  let systemPrompt = discoveryPrompt

  // Vague user fallback: after 4+ exchanges, nudge Claude to make a best guess
  if (exchangeCount >= 4) {
    systemPrompt += `

IMPORTANT: This is exchange ${exchangeCount + 1}. The user has been somewhat vague. If you still don't have clear answers for all 5 areas, make your best inference based on what you DO know. Fill in the profile with your best guess, mark any uncertain fields in the experience_detail, and present it as: "Based on what you've told me, here's my best read on where you are." The user can edit before confirming. Include the |||PROFILE_COMPLETE||| block now.`
  }

  // Hard cutoff: after 7 exchanges, force extraction
  if (exchangeCount >= 6) {
    systemPrompt += `

CRITICAL: This is exchange ${exchangeCount + 1}. You MUST include the |||PROFILE_COMPLETE||| block in this response, using your best inference for any missing information. Do not ask any more questions.`
  }

  const response = await callClaude({
    system: systemPrompt,
    messages,
    max_tokens: 1200,
  })

  const rawReply = extractText(response)
  const { displayText, profileData } = parseProfileFromResponse(rawReply)

  return {
    reply: displayText,
    profileComplete: profileData !== null,
    profileData,
    rawReply,
  }
}

module.exports = { processMessage }
