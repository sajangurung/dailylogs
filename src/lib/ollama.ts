const OLLAMA_API = `${process.env.OLLAMA_API_HOST || 'http://localhost:11434'}/api`;

export async function generateWithOllama(
  prompt: string,
  context: string,
  onToken?: (token: string) => void
): Promise<string> {
  try {
    if (!onToken) {
      // Non-streaming mode
      const response = await fetch(`${OLLAMA_API}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-oss:120b',
          prompt: `${prompt}\n\nContext:\n${context}`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    }

    // Streaming mode
    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Stream API error: ${response.statusText}${
          errorData.details ? `\n${errorData.details}` : ''
        }`
      );
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (!reader) {
      throw new Error('No response body');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        fullResponse += text;
        onToken(text);
      }
    } catch (error) {
      throw new Error(`Error reading stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }    return fullResponse;
  } catch (error) {
    console.error('Error generating with Ollama:', error);
    throw error;
  }
}

export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_API}/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json();
    return data.models.map((model: any) => model.name);
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}
