/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean
  readonly DEV: boolean
  readonly MODE: string
  // Add other env variables if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 