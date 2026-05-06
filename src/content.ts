import type { ExtensionMessage, PageData } from './types';

const NOISE_SELECTORS = [
  'nav', 'header', 'footer', 'aside',
  '.sidebar', '.advertisement', '.ad',
  '[role="navigation"]', '[role="banner"]',
];

const ARTICLE_SELECTORS = [
  'article',
  '[role="main"]',
  'main',
  '.post-content',
  '.article-body',
  '.entry-content',
];

function extractPageContent(): PageData {
  let contentEl: Element | null = null;

  for (const selector of ARTICLE_SELECTORS) {
    const el = document.querySelector(selector);
    if (el) {
      contentEl = el;
      break;
    }
  }

  const target = contentEl ?? document.body;
  const clone = target.cloneNode(true) as HTMLElement;

  NOISE_SELECTORS.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => el.remove());
  });

  const content = (clone.innerText ?? clone.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 15000);

  return {
    title: document.title,
    url: window.location.href,
    content,
  };
}

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender: chrome.runtime.MessageSender, sendResponse: (data: PageData) => void) => {
    if (message.type === 'EXTRACT_CONTENT') {
      sendResponse(extractPageContent());
    }
    return true;
  }
);