// src/popup.ts
import type { ExtensionResponse, SummaryResult } from './types';

// — Element refs —
const summarizeBtn = document.getElementById('summarize-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const loading = document.getElementById('loading') as HTMLDivElement;
const output = document.getElementById('output') as HTMLDivElement;
const errorEl = document.getElementById('error') as HTMLDivElement;
const pageTitleEl = document.getElementById('page-title') as HTMLParagraphElement;
const bulletsList = document.getElementById('bullets') as HTMLUListElement;
const insightsList = document.getElementById('insights') as HTMLUListElement;
const readingTimeEl = document.getElementById('reading-time') as HTMLSpanElement;
const cacheBadge = document.getElementById('cache-badge') as HTMLSpanElement;

// — Init —
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]: chrome.tabs.Tab[]) => {
  if (tab?.title) pageTitleEl.textContent = tab.title;
});

// — Handlers —
summarizeBtn.addEventListener('click', async () => {
  setLoading(true);
  setError(null);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) throw new Error('No active tab found.');

    // 1. Extract content from the page via content script
    const pageData = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_CONTENT' });

    if (!pageData?.content) {
      throw new Error('Could not extract content from this page.');
    }

    // 2. Send to background worker for AI summarization
    const result: ExtensionResponse = await chrome.runtime.sendMessage({
      type: 'SUMMARIZE',
      payload: pageData,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    displaySummary(result.summary, result.fromCache);

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Something went wrong.';
    setError(msg);
  } finally {
    setLoading(false);
  }
});

clearBtn.addEventListener('click', () => {
  output.hidden = true;
  clearBtn.hidden = true;
  summarizeBtn.hidden = false;
  setError(null);
});

copyBtn.addEventListener('click', async () => {
  const bullets = [...bulletsList.querySelectorAll('li')].map(li => `• ${li.textContent}`);
  const insights = [...insightsList.querySelectorAll('li')].map(li => `→ ${li.textContent}`);
  const text = ['Summary:', ...bullets, '', 'Key Insights:', ...insights].join('\n');

  await navigator.clipboard.writeText(text);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy Summary'), 2000);
});

// — Helpers —
function displaySummary(summary: SummaryResult, fromCache: boolean): void {
  bulletsList.innerHTML = summary.bullets.map(b => `<li>${sanitize(b)}</li>`).join('');
  insightsList.innerHTML = summary.insights.map(i => `<li>${sanitize(i)}</li>`).join('');
  readingTimeEl.textContent = summary.readingTime;
  cacheBadge.hidden = !fromCache;

  output.hidden = false;
  clearBtn.hidden = false;
  summarizeBtn.hidden = true;
}

function setLoading(state: boolean): void {
  loading.hidden = !state;
  summarizeBtn.disabled = state;
}

function setError(msg: string | null): void {
  errorEl.hidden = !msg;
  errorEl.textContent = msg ?? '';
}

function sanitize(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}