import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './Auth/Auth.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
    <AuthProvider>
    <App />
    </AuthProvider>
    </ChakraProvider>
  </StrictMode>,
)
