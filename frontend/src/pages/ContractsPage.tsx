import { useState } from 'react'
import { Box, Flex, Text, Input } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { useColorModeValue } from '../components/ui/color-mode'
import KanbanBoard from '../components/KanbanBoard'
import { useAppData } from '../contexts/ContractContext'
import {
  NativeSelect, Checkbox
} from '@chakra-ui/react'

export default function ContractsPage() {
  const [filterAma, setFilterAma] =useState(false)
  const [filterPncp, setFilterPncp] =useState(false)
  const [selectedSecretaria, setSelectedSecretaria] = useState<string>('')
  const { secretarias, contracts, loading, error } = useAppData()
  const [search, setSearch] = useState('')
  const headingColor = useColorModeValue('gray.800', 'white')
  const subColor = useColorModeValue('gray.500', 'gray.400')
  const searchBg = useColorModeValue('white', 'gray.900')
  const searchBorder = useColorModeValue('gray.200', 'gray.700')
  const inputColor = useColorModeValue('gray.800', 'white')
  const optionBg = useColorModeValue('white','#111827')
  const optionInputColor = useColorModeValue('#111827', 'white')

  // useEffect(() => {
  //   fetchContracts() 
  // }, [])

  const filteredContracts = contracts.filter(
      (contract) => {
          const q = search.toLowerCase()

          const matchesSearch =
          Object.values(contract).some((v) =>
              String(v)
              .toLowerCase()
              .includes(q)
          )

          const matchesSecretaria =
          !selectedSecretaria ||
          String(contract.secretaria_id) ===
              selectedSecretaria

          const matchesAma =
          !filterAma ||
          contract.publicado_ama === false

          const matchesPncp =
          !filterPncp ||
          contract.publicado_pncp === false

          return (
          matchesSearch &&
          matchesSecretaria &&
          matchesAma &&
          matchesPncp
          )
      }
    )

  return (
    <Box px={6} py={6}>
      <Box maxW="1400px" mx="auto">
        <Flex align="flex-end" justify="space-between" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Text
              fontFamily="'DM Serif Display', serif"
              fontSize="3xl"
              fontWeight="700"
              color={headingColor}
              letterSpacing="-0.02em"
              lineHeight="1"
              mb={1}
            >
              Contratos
            </Text>
            <Text fontSize="sm" color={subColor}>
              {contracts.length} contratos · filtrados por data de vencimento
            </Text>
          </Box>

          <Flex align="center" gap={3} flexWrap="wrap" >
             {/* AMA Filter */}
            <Checkbox.Root
                checked={filterAma}
                onCheckedChange={(e) =>
                setFilterAma(!!e.checked)
                }
                cursor="pointer"
            >
                <Checkbox.HiddenInput />
                <Checkbox.Control cursor="pointer"/>
                <Checkbox.Label>
                Por publicar AMA
                </Checkbox.Label>
            </Checkbox.Root>

            {/* PNCP Filter */}
            <Checkbox.Root
                checked={filterPncp}
                onCheckedChange={(e) =>
                setFilterPncp(!!e.checked)
                }
                cursor="pointer"
            >
                <Checkbox.HiddenInput />
                <Checkbox.Control cursor="pointer"/>
                <Checkbox.Label>
                Por publicar PNCP
                </Checkbox.Label>
            </Checkbox.Root>
            {/* Secretaria Filter */}
            <Box
                bg={searchBg}
                border="1px solid"
                borderColor={searchBorder}
                borderRadius="lg"
                px={3}
                py={2}
                minW="220px"
            >
                <NativeSelect.Root
                    size="sm"
                    width="220px"
                    
                    >
                    <NativeSelect.Field
                        value={selectedSecretaria}
                        onChange={(e) =>
                        setSelectedSecretaria(e.target.value)
                        }
                        bg={searchBg}
                        borderColor={searchBorder}
                        color={inputColor}
                        cursor="pointer"
                    >
                        <option value=""
                         style={{
                                backgroundColor: optionBg,
                                color: optionInputColor,
                                }}
                        >
                        Todas as secretarias
                        </option>

                        {secretarias.map((secretaria) => (
                        <option
                            key={String(secretaria.id)}
                            value={String(secretaria.id)}
                            style={{
                                backgroundColor: optionBg,
                                color: optionInputColor,
                                }}
                        >
                            {secretaria.nome}
                        </option>
                        ))}
                    </NativeSelect.Field>

                    <NativeSelect.Indicator />
                    </NativeSelect.Root>
            </Box>
            

            {/* Search */}
            <Flex
                align="center"
                gap={2}
                bg={searchBg}
                border="1px solid"
                borderColor={searchBorder}
                borderRadius="lg"
                px={3}
                py={2}
                w="260px"
                _focusWithin={{ borderColor: 'blue.500' }}
                transition="border-color 0.15s"
            >
                <Search size={14} color="#6b7280" />

                <Input
                border="none"
                outline="none"
                bg="transparent"
                color={inputColor}
                fontSize="sm"
                placeholder="Pesquisar contratos..."
                _placeholder={{ color: 'gray.400' }}
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
                p={0}
                h="auto"
                _focus={{ boxShadow: 'none' }}
                />
            </Flex>
            </Flex>
        </Flex>

        {error && (
          <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" px={4} py={3} mb={6}>
            <Text fontSize="sm" color="red.500">Failed to load: {error}</Text>
          </Box>
        )}

        <KanbanBoard contracts={filteredContracts} loading={loading}/>
      </Box>
    </Box>
  )
}