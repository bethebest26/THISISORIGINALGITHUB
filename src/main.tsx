import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';

// Handle Google OAuth Popup Callback
if (window.location.pathname.startsWith('/auth/callback') || window.location.pathname.includes('/auth/callback')) {
  // Attempt to notify opener window immediately
  if (window.opener) {
    try {
      window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
    } catch (e) {
      console.error("Failed to post OAuth success message:", e);
    }
  }

  // Show a beautifully themed loader while the popup automatically closes
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] text-white p-6 font-sans">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Access Validated!</h2>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-xs">
          Connecting secure credentials with BeTheBest. This window will close automatically.
        </p>
      </div>
    </StrictMode>
  );

  // Fallback to close window after 1.2 seconds if not already closed
  setTimeout(() => {
    try {
      window.close();
    } catch (e) {
      console.warn("Could not auto-close popup window:", e);
    }
  }, 1200);

} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  );
}
