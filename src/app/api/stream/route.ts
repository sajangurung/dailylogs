import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Use Edge Runtime

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    // Use environment variable for Ollama host with fallback
    const OLLAMA_HOST = process.env.NODE_ENV === 'production'
      ? (process.env.OLLAMA_API_HOST || 'http://ollama:11434')
      : 'http://localhost:11434';
    console.log('Connecting to Ollama at:', OLLAMA_HOST, 'ENV:', process.env.NODE_ENV); // Debug log

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss:120b',
        prompt: `${prompt}\n\nContext:\n${context}`,
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error('Ollama API error:', response.status, response.statusText); // Debug log
      return new Response(
        JSON.stringify({
          error: `Ollama API error: ${response.statusText}`,
          status: response.status
        }),
        { status: response.status }
      );
    }

    // Create a ReadableStream for the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.error('No response body from Ollama');
          return;
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);
            const lines = text.split('\n').filter(Boolean);

            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.response) {
                  controller.enqueue(encoder.encode(json.response));
                }
                if (json.done) {
                  controller.close();
                  return;
                }
              } catch (e) {
                console.error('Error parsing JSON:', line, e);
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: errorMessage,
        stack: errorStack
      }),
      { status: 500 }
    );
  }
}
