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
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5-minute timeout (300,000ms)

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
        template_id: templateId,
        current_code: currentCode
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Generation request failed' }));
      const msg = errorData.detail || errorData.error || errorData.message || 'Failed to process prompt';
      console.error('Backend Error Response:', errorData);
      throw new Error(msg);
    }

    const data: GenerateResult = await res.json();
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Generation request took longer than 5 minutes. Please try again.');
    }
    console.error('Generation call failed:', err);
    throw err;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
