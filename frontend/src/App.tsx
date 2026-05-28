import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ContractsPage from './pages/ContractsPage'
import UserPage from './pages/UserPage'
import SecretariasPage from './pages/SecretariasPage'
import EmpresasPage from './pages/EmpresasPage'
import NovoContrato from './pages/NovoContratoPage'

export default function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ContractsPage />} />
          <Route path="/contratos" element={<ContractsPage />} />
          <Route path="/usuarios" element={<UserPage />} />
          <Route path='/secretarias' element={<SecretariasPage />} />
          <Route path='/empresas' element={<EmpresasPage />} />
          <Route path='/novoContrato' element={<NovoContrato />} />
        </Routes>
      </BrowserRouter>
  )
}