import { bridgeFabricCallback } from '@microsoft/rayfin-auth-provider-fabric';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';

import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback.tsx';
import { AuthProvider } from './hooks/AuthContext.tsx';
import { ServiceContainer } from './services/ServiceContainer';

import './main.css';
import './styles/theme.css';
import './index.css';

// Backward compat: old Fabric Portal may redirect the popup to the bare origin
// with handoff params in the URL hash. Bridge the code to the opener and close.
if (bridgeFabricCallback()) {
  // Popup is closing — skip the rest of the bootstrap.
} else {
  const root = createRoot(document.getElementById('root')!);
  root.render(<p role="status">Loading Field Services configuration...</p>);
  ServiceContainer.create()
    .then(() => root.render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider>
          <App />
          <Toaster position="top-right" />
        </AuthProvider>
      </ErrorBoundary>
    ))
    .catch((error: unknown) => {
      console.error('Field Services startup failed:', error);
      root.render(
        <main role="alert" className="p-6">
          <h1>Field Services could not start</h1>
          <p>{error instanceof Error ? error.message : String(error)}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </main>
      );
    });
}
