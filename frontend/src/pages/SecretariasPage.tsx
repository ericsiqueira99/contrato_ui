import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Table,
  Text,
} from '@chakra-ui/react'

import { Check, Pencil, Plus, Search, Trash, X } from 'lucide-react'
import { useState } from 'react'

import { useAppData } from '../contexts/ContractContext'
import { useColorModeValue } from '../components/ui/color-mode'
import { API_URL, type Secretaria } from '../types'

export default function SecretariasPage() {
  const { secretarias, fetchSecretarias } = useAppData()

  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | string | null>(null)
  const [editedItem, setEditedItem] = useState<Secretaria | null>(null)

  const bg = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.800')
  const headingColor = useColorModeValue('gray.800', 'white')
  const subColor = useColorModeValue('gray.500', 'gray.400')
  const inputBg = useColorModeValue('white', 'gray.900')

  function startEditing(item: Secretaria) {
    setEditingId(item.id ?? 'new')
    setEditedItem(item)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditedItem(null)
  }

  function updateField(field: keyof Secretaria, value: unknown) {
    setEditedItem(prev => ({ ...prev!, [field]: value }))
  }

  async function handleSave() {
    const isNew = editingId === 'new'

    const url = isNew
      ? `${API_URL}/create_secretarias`
      : `${API_URL}/update_secretarias/${editedItem?.id}`

    const method = isNew ? 'POST' : 'PUT'

    const payload = { ...editedItem }
    if (isNew) delete payload.id

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    await fetchSecretarias()
    cancelEditing()
  }

  async function handleDelete(id?: number | string) {
    if (!id) return

    await fetch(`${API_URL}/delete_secretarias/${id}`, {
      method: 'DELETE',
    })

    await fetchSecretarias()
    cancelEditing()
  }

  function addNew() {
    setEditingId('new')
    setEditedItem({ nome: '' })
  }

  const filtered = secretarias.filter(s =>
    Object.values(s).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <Box px={6} py={6}>
      <Box maxW="1400px" mx="auto">

        {/* Header */}
        <Flex align="flex-end" justify="space-between" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Text fontFamily="'DM Serif Display', serif" fontSize="3xl" fontWeight="700" color={headingColor}>
              Secretarias
            </Text>
            <Text fontSize="sm" color={subColor}>
              {filtered.length} secretarias cadastradas
            </Text>
          </Box>

          <Flex gap={3} align="center">

            {/* Search */}
            <Flex
              align="center"
              gap={2}
              bg={inputBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="lg"
              px={3}
              py={2}
              w="260px"
              transition="border-color 0.15s"
            >
              <Search size={14} />
              <Input
                border="none"
                bg="transparent"
                fontSize="sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar secretarias..."
                _focus={{ boxShadow: 'none' }}
                h="auto"
                
              />
            </Flex>

            <Button colorPalette="blue" size="sm" onClick={addNew}>
              <Plus size={14} />
              Nova secretaria
            </Button>
          </Flex>
        </Flex>

        {/* Table */}
        <Box bg={bg} border="1px solid" borderColor={borderColor} borderRadius="2xl" overflow="hidden">

          <Table.Root>
            <Table.Header bg={headerBg}>
              <Table.Row>
                <Table.ColumnHeader>Nome</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Ações</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {/* NEW ROW */}
              {editingId === 'new' && (
                <Table.Row bg="blue.500/5">
                  <Table.Cell>
                    <Input
                      size="sm"
                      value={editedItem?.nome ?? ''}
                      onChange={e => updateField('nome', e.target.value)}
                    />
                  </Table.Cell>

                  <Table.Cell>
                    <Flex justify="flex-end" gap={2}>
                      <IconButton colorPalette="green" size="sm" onClick={handleSave}>
                        <Check size={14} />
                      </IconButton>
                      <IconButton size="sm" variant="outline" onClick={cancelEditing}>
                        <X size={14} />
                      </IconButton>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              )}

              {/* LIST */}
              {filtered.map(item => {
                const isEditing = editingId === item.id

                return (
                  <Table.Row key={String(item.id)}>
                    <Table.Cell>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={editedItem?.nome ?? ''}
                          onChange={e => updateField('nome', e.target.value)}
                        />
                      ) : (
                        <Text fontWeight="500">{item.nome}</Text>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      <Flex justify="flex-end" gap={2}>
                        {isEditing ? (
                          <>
                            <IconButton colorPalette="green" size="sm" onClick={handleSave}>
                              <Check size={14} />
                            </IconButton>

                            <IconButton
                              colorPalette="red"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              disabled
                            >
                              <Trash size={14} />
                            </IconButton>

                            <IconButton size="sm" variant="outline" onClick={cancelEditing}>
                              <X size={14} />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton size="sm" variant="outline" onClick={() => startEditing(item)}>
                            <Pencil size={14} />
                          </IconButton>
                        )}
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                )
              })}

            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </Box>
  )
}