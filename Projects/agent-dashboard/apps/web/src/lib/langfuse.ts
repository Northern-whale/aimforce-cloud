import { Langfuse } from 'langfuse';

const globalForLangfuse = globalThis as unknown as {
  langfuse: Langfuse | undefined;
};

export const langfuse =
  globalForLangfuse.langfuse ??
  new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: process.env.LANGFUSE_BASEURL || 'https://cloud.langfuse.com',
    flushAt: 10,
    flushInterval: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForLangfuse.langfuse = langfuse;
}
