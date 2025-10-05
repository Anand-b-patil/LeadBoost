export type GenerateRequest = {
  prompt: string;
  model?: string;
  system?: string;
  temperature?: number;
};

export type GenerateResponse = {
  text?: string;
  error?: string;
};

export async function generateFromGemini(req: GenerateRequest): Promise<GenerateResponse> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return res.json();
}


