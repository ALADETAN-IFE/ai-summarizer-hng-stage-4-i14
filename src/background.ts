import type { ExtensionMessage, ExtensionResponse, PageData, SummaryResult } from './types';

const API_KEY = process.env.GROQ_API_KEY ?? '';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CACHE_PREFIX = 'summary_';

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender: chrome.runtime.MessageSender, sendResponse: (r: ExtensionResponse) => void) => {
    if (message.type === 'SUMMARIZE') {
      handleSummarize(message.payload).then(sendResponse);
      return true;
    }
  }
);

async function handleSummarize(pageData: PageData): Promise<ExtensionResponse> {
  const cacheKey = CACHE_PREFIX + btoa(pageData.url).slice(0, 50);
  const cached = await chrome.storage.local.get(cacheKey);

  if (cached[cacheKey]) {
    return { success: true, summary: cached[cacheKey] as SummaryResult, fromCache: true };
  }

  try {
    const summary = await callGroq(pageData);
    await chrome.storage.local.set({ [cacheKey]: summary });
    return { success: true, summary, fromCache: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

async function callGroq({ title, content }: PageData): Promise<SummaryResult> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes web pages. Always respond with valid JSON only — no markdown, no backticks, no explanation.',
        },
        {
          role: 'user',
          content: buildPrompt(title, content),
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Groq error: ${err?.error?.message ?? response.status}`);
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? '';

  if (!text) throw new Error('Empty response from Groq');

  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse Groq response as JSON');

  const parsed = JSON.parse(match[0]) as SummaryResult;

  if (!Array.isArray(parsed.bullets) || !Array.isArray(parsed.insights)) {
    throw new Error('Unexpected response shape');
  }

  return parsed;
}

function buildPrompt(title: string, content: string): string {
  return `
Page title: ${title}

Page content:
${content}

Respond ONLY with a JSON object in this exact shape:
{
  "bullets": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "insights": ["insight 1", "insight 2", "insight 3"],
  "readingTime": "X min read"
}
`.trim();
}