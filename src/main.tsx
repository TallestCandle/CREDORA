import './patch-fetch';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PrivyProvider } from '@privy-io/react-auth';

const privyAppId = ((import.meta as any).env?.VITE_PRIVY_APP_ID as string) || "cmquzw4f600ag0cjom7h2gnp0";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={privyAppId}
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
          solana: {
            createOnLogin: 'all-users',
          },
        },
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
);
