interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_STRIPE_CHECKOUT_PRO_MONTHLY: string;
  readonly VITE_STRIPE_CHECKOUT_PRO_ANNUAL: string;
  readonly VITE_STRIPE_PRICE_ID_PRO_MONTHLY: string;
  readonly VITE_STRIPE_PRICE_ID_PRO_ANNUAL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
