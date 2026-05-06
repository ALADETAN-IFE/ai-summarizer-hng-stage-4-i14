# AI Page Summarizer

AI Page Summarizer is a Chrome Extension built with Manifest V3 that extracts readable content from the current page, sends it to Groq's chat completions API, and renders a structured summary inside the popup.

## Features

- Extracts content from the active webpage
- Shows the active page title in the popup
- Summarizes pages into bullet points and key insights
- Shows an estimated reading time
- Caches summaries by URL with `chrome.storage.local`
- Uses a background service worker for secure AI requests
- Includes copy, clear, loading, cached, and error states in the popup UI

## Project Structure

```text
public/
  manifest.json
  popup.html
  popup.css
  icons/

src/
  background.ts
  content.ts
  popup.ts
  types.ts
```

## How It Works

1. The content script extracts readable text from the active page.
2. The popup sends the extracted content to the background service worker.
3. The background worker checks `chrome.storage.local` for a cached summary.
4. If no cache exists, it calls Groq and parses the JSON response.
5. The popup renders the summary, insights, and reading time.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and add your AI API key:

```bash
GROQ_API_KEY=your_api_key_here
```

The build uses `dotenv-webpack`, so the key is available to the background service worker at build time.

### 3. Build the extension

```bash
npm run build
```

This generates the extension files in `dist/`.

### 4. Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select the `dist/` folder

## Architecture

The extension is split into three runtime contexts:

- `content.ts` extracts readable text from the current page
- `popup.ts` manages the popup UI and messaging
- `background.ts` performs AI requests and handles caching

The build copies the static files from `public/` and bundles the TypeScript entry points with Webpack.

## AI Integration

The popup never talks to the AI API directly. Instead, it sends the extracted page data to the background service worker, which:

- checks `chrome.storage.local` for a cached summary
- calls Groq's `llama-3.3-70b-versatile` chat completions model when needed
- parses the JSON response into bullets, insights, and reading time

This keeps the API key out of the content script and avoids exposing it in the page context.

## Usage

After loading the unpacked extension:

1. Open any article page in Chrome.
2. Click the extension icon.
3. Review the page title in the popup.
4. Click `Summarize Page`.
5. Copy or clear the result if needed.

## Security Decisions

- API access is handled only in the background service worker
- The extension uses minimal permissions: `activeTab`, `storage`, and `scripting`
- Page content is sanitized before being injected into the popup DOM
- Message passing is typed through shared interfaces in `src/types.ts`
- The content script only reads page text and does not modify page behavior
- The manifest uses a `background` service worker and a popup action, with a content script injected on all URLs

## Trade-offs

- The content extraction logic is lightweight and heuristic-based, so it may miss some page layouts
- `chrome.storage.local` is used for caching, which keeps the extension simple but does not provide long-term persistence guarantees
- AI output is expected to be valid JSON, so malformed responses require parsing safeguards
- The extension is optimized for article pages, not every possible webpage layout
- The extension currently depends on a local `.env` file during build time rather than runtime secret management

## Demo

Short demo video: [Add video link here]

## Notes

- This extension is intended to be installed locally as an unpacked extension
- It is not meant for Chrome Web Store submission
- The popup UI supports summary copy, loading feedback, and error handling
