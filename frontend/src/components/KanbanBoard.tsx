import { Box, Text, Flex, Badge, Spinner } from '@chakra-ui/react'
import ContractCard from './ContractCard'
import { useColorModeValue } from './ui/color-mode'
import type { Contract } from '../types'

type Column = {
  id: string
  label: string
  color: string
  accent: string
  filter: (contract: Contract) => boolean
}

type Props = {
  contracts: Contract[]
  loading: boolean
}

function daysDiff(dateStr?: string): number | null {
  if (!dateStr) return null
  // Supports dd-mm-yyyy or yyyy-mm-dd
  let date: Date
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    date = new Date(dateStr)
  } else {
    const [dd, mm, yyyy] = dateStr.split('-')
    date = new Date(`${yyyy}-${mm}-${dd}`)
  }
  if (isNaN(date.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const COLUMNS: Column[] = [
  {
    id: 'active',
    label: 'Ativo',
    color: 'green',
    accent: '#22c55e',
    filter: (c) => {
      const diff = daysDiff(c.vigencia_fim)
      return diff !== null && diff > 60
    },
  },
  {
    id: 'expiring30',
    label: 'Pra vencer (30 dias)',
    color: 'orange',
    accent: '#f9f516',
    filter: (c) => {
      const diff = daysDiff(c.vigencia_fim)
      return diff !== null && diff > 0 && diff <= 30
    },
  },
  {
    id: 'expiring60',
    label: 'Pra vencer (60 dias)',
    color: 'orange',
    accent: '#f97316',
    filter: (c) => {
      const diff = daysDiff(c.vigencia_fim)
      return diff !== null && diff > 30 && diff <= 60
    },
  },
  {
    id: 'expired',
    label: 'Vencido',
    color: 'red',
    accent: '#ef4444',
    filter: (c) => {
      const diff = daysDiff(c.vigencia_fim)
      return diff !== null && diff <= 0
    },
  },
]

function KanbanColumn({ column, contracts, loading }: { column: Column, contracts: Contract[], loading: boolean }) {
  const colBg = useColorModeValue('white', 'gray.900')
  const colBorder = useColorModeValue('gray.200', 'gray.800')
  const headerBg = useColorModeValue('gray.50', 'gray.950')
  const labelColor = useColorModeValue('gray.700', 'white')
  const emptyColor = useColorModeValue('gray.400', 'gray.600')

  return (
    <Box
      flex="1" minW="280px" maxW="340px"
      bg={colBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={colBorder}
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Box px={4} py={3} borderBottom="1px solid" borderColor={colBorder} bg={headerBg}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={2}>
            <Box w="8px" h="8px" borderRadius="full" bg={column.accent} boxShadow={`0 0 8px ${column.accent}`} />
            <Text fontSize="sm" fontWeight="600" color={labelColor} textTransform="uppercase" fontFamily="'DM Serif Display', serif">
              {column.label}
            </Text>
          </Flex>
          <Badge variant="subtle" colorPalette={column.color} fontSize="xs" borderRadius="full">
            {contracts.length}
          </Badge>
        </Flex>
      </Box>

      <Box flex={1} overflowY="auto" p={3} display="flex" flexDirection="column" gap={3}>
        {loading ? (
          <Flex justify="center" py={8}><Spinner color={column.accent} size="sm" /></Flex>
        ) : contracts.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={10} opacity={0.4}>
            <Text fontSize="xs" color={emptyColor}>Sem contratos</Text>
          </Flex>
        ) : (
          contracts.map((contract, i) => (
            <ContractCard key={contract.id ?? i} contract={contract} />
          ))
        )}
      </Box>
    </Box>
  )
}

export default function KanbanBoard({ contracts, loading }: Props) {
  return (
    <Flex gap={4} align="flex-start" overflowX="auto" pb={4}>
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.id}
          column={col}
          contracts={contracts.filter(col.filter)}
          loading={loading}
        />
      ))}
    </Flex>
  )
}