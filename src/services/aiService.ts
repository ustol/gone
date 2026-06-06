/**
 * Provider-agnostic AI service for grammar and spell check.
 * Swap out the implementation by changing the provider in AiProvider.
 */

export interface AiCheckResult {
  improved: string
  hasChanges: boolean
}

export interface AiProvider {
  checkGrammar(text: string): Promise<AiCheckResult>
}

// Anthropic/Claude implementation
class AnthropicProvider implements AiProvider {
  private readonly apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async checkGrammar(text: string): Promise<AiCheckResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a compassionate editor helping improve funeral and memorial tributes.

Review the following tribute message and:
1. Correct any spelling errors
2. Improve grammar and sentence flow
3. Preserve the original meaning and personal tone entirely
4. Maintain the respectful, warm, dignified tone appropriate for a memorial
5. Do NOT change or invent any personal names, places, or specific facts
6. Do NOT add new information not present in the original
7. Return ONLY the improved text — no explanations, no commentary, no preamble

Original text:
${text}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error((err as { error?: { message?: string } }).error?.message ?? 'AI check failed')
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>
    }
    const improved = data.content[0]?.text?.trim() ?? text
    return { improved, hasChanges: improved !== text }
  }
}

// Factory — add new providers here without changing consuming code
function createAiProvider(): AiProvider {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  if (apiKey) return new AnthropicProvider(apiKey)

  // Fallback: no-op provider (returns original text)
  return {
    async checkGrammar(text: string): Promise<AiCheckResult> {
      return { improved: text, hasChanges: false }
    },
  }
}

export const aiService: AiProvider = createAiProvider()
