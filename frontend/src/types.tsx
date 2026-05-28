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

  [key: string]: unknown
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
  [key: string]: unknown
}

export type Empresa = {
  id?: number | string
  razao_social?: string
  cnpj?: string
  [key: string]: unknown
}
