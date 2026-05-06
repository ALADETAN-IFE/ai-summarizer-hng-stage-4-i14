// src/types.ts

// What the content script extracts from the page
export interface PageData {
  title: string;
  url: string;
  content: string;
}

// What the AI returns
export interface SummaryResult {
  bullets: string[];
  insights: string[];
  readingTime: string;
}

// Every message between contexts has a type + payload
export type ExtensionMessage =
  | { type: 'EXTRACT_CONTENT' }
  | { type: 'SUMMARIZE'; payload: PageData };

// Every response has a success flag
export type ExtensionResponse =
  | { success: true; summary: SummaryResult; fromCache: boolean }
  | { success: false; error: string };