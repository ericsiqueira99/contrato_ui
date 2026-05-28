// contexts/AppDataContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { API_URL, type Contract, type Empresa, type Secretaria, type Usuario } from '../types'

type AppDataContextType = {
  contracts: Contract[],
  fetchContracts: () => Promise<void>,
  fetchUsers: () => Promise<void>,
  fetchSecretarias: () => Promise<void>,
  fetchEmpresas: () => Promise<void>,
  secretarias: Secretaria[],
  empresas: Empresa[],
  usuarios: Usuario[],
  loading: boolean,
  error: string|null
}

const AppDataContext = createContext<
  AppDataContextType | undefined
>(undefined)

type Props = {
  children: ReactNode
}

export function AppDataProvider({children,}: Props) {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchContracts() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `${API_URL}/contratos`
      )

      if (!res.ok) {
        throw new Error(
          'Erro ao carregar contratos'
        )
      }

      const data = await res.json()

      setContracts(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro desconhecido'
      )
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
      const res = await fetch(
        `${API_URL}/usuarios`
      )

      if (!res.ok) {
        throw new Error(
          'Erro ao carregar usuarios'
        )
      }

      const data = await res.json()

      setUsuarios(data)
  }

  async function fetchSecretarias() {
      const res = await fetch(
        `${API_URL}/secretarias`
      )

      if (!res.ok) {
        throw new Error(
          'Erro ao carregar secretarias'
        )
      }

      const data = await res.json()

      setSecretarias(data)
  }

  async function fetchEmpresas() {
      const res = await fetch(
        `${API_URL}/empresas`
      )

      if (!res.ok) {
        throw new Error(
          'Erro ao carregar empresas'
        )
      }

      const data = await res.json()

      setEmpresas(data)
  }

  useEffect(() => {
    fetchContracts()
    fetchSecretarias()
    fetchEmpresas()
    fetchUsers()
  }, [])

  return (
    <AppDataContext.Provider
      value={{
        contracts,
        fetchContracts,
        fetchUsers,
        fetchSecretarias,
        fetchEmpresas,
        secretarias,
        empresas,
        usuarios,
        loading,
        error
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = useContext(AppDataContext)

  if (!context) {
    throw new Error(
      'useAppData must be used inside AppDataProvider'
    )
  }

  return context
}