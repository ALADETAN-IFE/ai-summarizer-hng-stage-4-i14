# Frontend Wizards: Stage 4A

Build an AI Page Summarizer Chrome Extension.

## Objective

Build a Chrome Extension (Manifest V3) that:

- Extracts content from the current webpage
- Sends it to an AI API
- Displays a structured summary
- Optionally highlights key points on the page

This must be a real, installable, useful Chrome Extension.

## What the Extension Should Do

When a user clicks the extension icon, it should:

- Extract meaningful content from the current page
- Send it to an AI provider such as OpenAI or Gemini
- Display:
  - Bullet-point summary
  - Key insights
  - Estimated reading time
- Optionally highlight important sections in-page

## Required Features

### 1. Manifest V3 Setup

Must include:

- `manifest.json`
- Background service worker
- Popup UI
- Content script
- Proper permissions
- No deprecated Manifest V2

### 2. Popup UI

The popup must include:

- Page title
- `Summarize Page` button
- Loading state
- Summary output area
- Clear/reset button

UX expectations:

- Responsive
- Clean layout
- No clutter
- Keyboard accessible
- Visible focus states

### 3. Content Script

The extension must:

- Extract readable page content
- Avoid navigation and sidebar clutter
- Prefer main article content if possible

Bonus:

- Use heuristic filtering
- Or integrate a readability parser

### 4. AI Integration

Must:

- Call AI securely
- Never expose the API key in the frontend
- Use a background script or proxy server

You must not:

- Hardcode API keys in the content script
- Commit secrets to the repo

### 5. Background Service Worker

Responsible for:

- Receiving messages from the popup
- Making the AI API request
- Returning the summary
- Handling errors
- Managing rate limiting, if needed

### 6. Storage

Use `chrome.storage` to:

- Cache summaries per URL
- Prevent duplicate API calls
- Save user settings, optionally

## Technical Requirements

- Manifest V3
- Clean file structure
- Modular code
- No console errors
- Graceful error handling
- Minimal required permissions

## Security Requirements

- No exposed secrets
- AI calls must be secure
- Minimal permissions
- Validate message passing
- Prevent XSS injection
- Sanitize injected content

## UI/UX Expectations

The popup must:

- Show a loading spinner while summarizing
- Show an error message if the API fails
- Display a formatted summary with bullets and spacing
- Handle long summaries gracefully
- Scroll if needed

Optional:

- Dark/light mode
- Copy summary button
- Word count
- `Summarize in 3 bullet points` option

## Acceptance Criteria

You will be graded on:

- Extension installs correctly
- Works on most article pages
- Extracts meaningful content
- Summary generated correctly
- No exposed API keys
- Clean architecture
- Proper Chrome messaging
- Good UX polish
- Minimal performance impact

## Submission Requirements

- GitHub repository
- README including:
  - Setup instructions
  - Architecture explanation
  - AI integration explanation
  - Security decisions
  - Trade-offs
- Short demo video, 2-5 minutes recommended

## Installation Note

This is a local extension and is not to be uploaded to the Google Chrome Extension Store. Include steps to download and use your extension in the README section.

## Submission Form

- Slack display name must be unique
- Deadline: 5th May, 2026
- [Submission link](https://docs.google.com/forms/d/e/1FAIpQLSfwkOeNFu2L-vn6VB9ctH8OFiQkFcTujxs-nwpDhG6C84WZqA/viewform?usp=publish-editor)
