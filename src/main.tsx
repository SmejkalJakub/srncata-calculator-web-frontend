import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import PWAPrompt from 'react-ios-pwa-prompt';

import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true
  // if you want a custom “Update available” toast later:
  // onNeedRefresh() { ... },
  // onOfflineReady() { ... },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <PWAPrompt
        promptOnVisit={1}
        timesToShow={3}
      />
    </BrowserRouter>
  </StrictMode>
);