/// <reference types="vite/client" />

export function registerOffline(): void {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      console.warn('Offline support could not be enabled.', error);
    });
  }
}
