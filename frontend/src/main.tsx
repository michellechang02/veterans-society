import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './Auth/Auth.tsx';
import customTheme from "./theme.ts";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={customTheme}>
    <AuthProvider>
    <App />
    </AuthProvider>
    </ChakraProvider>
  </StrictMode>,
)
