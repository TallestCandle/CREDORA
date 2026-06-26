import './patch-fetch';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PrivyProvider } from '@privy-io/react-auth';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId="cmquzw4f600ag0cjom7h2gnp0"
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'dark',
          accentColor: '#64748b',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'all-users',
          },
        },
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
);
