/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TASKON_BASE_URL: string;
  readonly VITE_TASKON_CLIENT_ID: string;
  readonly VITE_TASKON_PRIVATE_KEY: string;
  readonly VITE_TASKON_IS_DEV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
