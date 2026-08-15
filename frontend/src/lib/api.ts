export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  prompt: string;
}

export interface GenerateResult {
  type: 'app' | 'text';
  code?: string;
  content?: string;
  message?: string;
  prompt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchTemplates(): Promise<TemplateItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/templates`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    const data = await res.json();
    return data.templates || [];
  } catch (err) {
    return [
      {
        id: 'trip-splitter',
        title: '💰 Trip Expense Splitter',
        category: 'Finance',
        prompt: 'Create a Trip Expense Splitter micro-app to split bills among friends with settlement calculation.'
      }
    ];
  }
}

export async function generateMicroApp(
  prompt: string,
  templateId?: string,
  currentCode?: string
): Promise<GenerateResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120-second timeout

  try {
    const res = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
        template_id: templateId,
        current_code: currentCode
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Generation request failed' }));
      throw new Error(errorData.detail || 'Failed to process prompt');
    }

    const data: GenerateResult = await res.json();
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Generation timed out after 120 seconds. Please try again with a shorter prompt.');
    }
    console.error('Generation call failed:', err);
    throw err;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
