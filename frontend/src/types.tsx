export const API_URL = '/api'

export type Contract = {
  id?: number | string
  nome?: string
  empresa?: string
  valor?: number | string
  valor_inicial?: number | string
  vigencia_inicio?: string
  vigencia_fim?: string
  status?: string
  objeto?: string
  numero_contrato?: string
  secretaria_id?: number
  empresa_id?: number
  gestor_id?: number
  legislacao?: string
  publicado_ama?: boolean 
  publicado_pncp?: boolean | null
  criado_em?: string
  fiscais?: number[]
  [key: string]: unknown
}

export type NovoContratoForm = {
  numero_contrato?: string
  objeto?: string
  valor_inicial?: string
  vigencia_inicio?: string
  vigencia_fim?: string
  secretaria_id?: string | number
  empresa_id?: string | number
  gestor_id?: string | number
  legislacao?: string
  publicado_ama?: boolean | null
  publicado_pncp?: boolean | null
  criado_em?: string
  assinado_em?: string
  fiscais?: number[]
}

export type Secretaria = {
  id?: number | string
  nome?: string
 
  [key: string]: unknown
}

export type Usuario = {
  id?: number | string
  nome?: string
  email?: string
  secretaria_id?: number | string
  telefone?: string
  [key: string]: unknown
}

export type Empresa = {
  id?: number | string
  razao_social?: string
  cnpj?: string
  telefone?: string
  email?: string
  [key: string]: unknown
}
