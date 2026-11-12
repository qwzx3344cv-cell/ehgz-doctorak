import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Firebase Cloud Messaging & Push Notifications
async function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      console.log('Firebase Service Worker registered successfully with scope:', registration.scope);
    } catch (error) {
      console.warn('Firebase Service Worker registration failed, falling back to sw.js:', error);
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (err) {
        console.warn('Service Worker fallback error:', err);
      }
    }
  }
}

registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
