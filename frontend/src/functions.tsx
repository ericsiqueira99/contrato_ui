import type { Empresa, Secretaria } from "./types"

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
}

function similarity(a: string, b: string) {
  a = normalize(a)
  b = normalize(b)

  if (a === b) return 1

  if (a.includes(b) || b.includes(a)) return 0.8

  return 0
}

export function findBestMatchSecretariaId(
  name: string,
  list: Secretaria[]
) {
  if (!name || !list?.length) return null

  let best = { id: null as any, score: 0 }

  for (const item of list) {
    const score = similarity(name, item.nome ?? "")

    if (score > best.score) {
      best = { id: item.id, score }
    }
  }

  return best.score >= 0.6 ? best.id : null
}

export function findBestMatchEmpresaId(
  name: string,
  list: Empresa[]
) {
  if (!name || !list?.length) return null

  let best = { id: null as any, score: 0 }

  for (const item of list) {
    const score = similarity(name, item.razao_social ?? "")

    if (score > best.score) {
      best = { id: item.id, score }
    }
  }

  return best.score >= 0.6 ? best.id : null
}

export function formatDateToInput(dateStr?: string) {
  if (!dateStr) return ""

  const [day, month, year] = dateStr.split("/")

  if (!day || !month || !year) return ""

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}