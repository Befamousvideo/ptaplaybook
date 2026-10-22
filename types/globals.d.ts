declare module "*.css";

interface Window {
  turnstile?: {
    render: (el: Element, opts: { sitekey: string }) => unknown;
    getResponse: (id: unknown) => string;
    reset: (id: unknown) => void;
  };
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
}
