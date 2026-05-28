import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from './components/ui/color-mode.tsx'
import { AppDataProvider } from './contexts/ContractContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ChakraProvider value={defaultSystem}>
        <ColorModeProvider defaultTheme="dark">
            <AppDataProvider>
                <App />
            </AppDataProvider>    
        </ColorModeProvider>
      </ChakraProvider>
  </StrictMode>,
)
