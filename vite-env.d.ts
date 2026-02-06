/// <reference types="vite/client" />

// Type definitions for Vite env vars because TypeScript gets cranky without them
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
