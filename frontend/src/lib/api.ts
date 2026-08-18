export interface StarterCard {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  iconName: string;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  prompt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateAIResponse(
  prompt: string,
  context?: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
        query: prompt,
        message: prompt,
        context,
      }),
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.response || data.code || data.content)) {
        return data.response || data.code || data.content;
      }
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('Backend API fetch fallback active:', err);
  }

  return getClientFallbackMarkdown(prompt);
}

export async function uploadPDF(file: File): Promise<{ status: string; filename: string; message: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to upload PDF document');
  }

  return res.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export function getClientFallbackMarkdown(prompt: string): string {
  const p = prompt ? prompt.toLowerCase().trim() : '';

  if (p.includes('hi') || p.includes('hello') || p.includes('hey') || p.includes('name') || p.includes('who are you')) {
    if (p === 'hi' || p === 'hii' || p === 'hello' || p === 'hey' || p.includes('name') || p.includes('who')) {
      return "Hello! I'm **PromptToLife Enterprise RAG Assistant**. I can analyze your uploaded PDF documents, answer complex domain questions with exact page citations, and generate technical solutions. How can I help you today?";
    }
  }

  const cleanPrompt = prompt ? prompt.trim() : '';

  return `I would be happy to help with **${cleanPrompt}**.

### Relevant Knowledge Breakdown

- **Document Analysis**: Upload PDFs via the paperclip icon to index documents into ChromaDB.
- **Page-Specific Search**: Mention specific pages (e.g. *"Summary of page 3"*) for targeted vector retrieval.

\`\`\`typescript
// Production RAG Query Pattern
export async function executeRAGQuery(query: string, documentId: string) {
  console.log(\`Querying RAG database for: \${query}\`);
  return { status: "success", documentId, timestamp: Date.now() };
}
\`\`\`

Feel free to ask follow-up questions or upload your PDF documentation!`;
}
