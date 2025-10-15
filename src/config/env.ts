const env = {
  openAiApiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  openAiModel: import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-3.5-turbo',
}

if (!env.openAiApiKey && typeof console !== 'undefined') {
  console.warn('[env] VITE_OPENAI_API_KEY が設定されていません。')
}

export default env
