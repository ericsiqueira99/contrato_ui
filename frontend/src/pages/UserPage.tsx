import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  NativeSelect,
  Table,
  Text,
} from '@chakra-ui/react'

import { Check, Pencil, Plus, X, Search} from 'lucide-react'
import { useState } from 'react'
import { useAppData } from '../contexts/ContractContext'
import { useColorModeValue } from '../components/ui/color-mode'
import { API_URL, type Usuario } from '../types'


export default function UsersTable() {
  const { secretarias, usuarios, fetchUsers } = useAppData()

  const [editingId, setEditingId] = useState<number | string | null>(null)
  const [editedUser, setEditedUser] = useState<Usuario | null>(null)
  const [search, setSearch] = useState('')
  const [selectedSecretaria, setSelectedSecretaria] = useState('')
  const bg = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.800')
  const muted = useColorModeValue('gray.500', 'gray.400')

  const headingColor = useColorModeValue('gray.800', 'white')
  const subColor = useColorModeValue('gray.500', 'gray.400')

  function startEditing(user: Usuario) {
    setEditingId(user.id ?? 'new')
    setEditedUser(user)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditedUser(null)
  }

  function updateField(field: keyof Usuario, value: unknown) {
    setEditedUser(prev => ({ ...prev!, [field]: value }))
  }

  async function handleSave() {
    try {
        const isNew = !editedUser?.id || editedUser.id === 'new'

        const url = isNew
        ? `${API_URL}/user/`
        : `${API_URL}/users/${editedUser.id}`

        const method = isNew ? 'POST' : 'PUT'

        const payload = { ...editedUser }

        // IMPORTANT: remove fake id before POST
        if (isNew) delete payload.id

        await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        })

        await fetchUsers()
        cancelEditing()
    } catch (err) {
        console.error(err)
    }
    }

  function addNewUser() {
    startEditing({
      id: 'new',
      nome: '',
      email: '',
      secretaria_id: '',
    })
  }

  function getSecretariaName(id?: number | string) {
    return secretarias.find(s => String(s.id) === String(id))?.nome ?? '—'
  }

  const filteredUsers = usuarios.filter(user => {
    const q = search.toLowerCase()

    const matchesSearch = Object.values(user).some(v =>
        String(v).toLowerCase().includes(q)
    )

    const matchesSecretaria =
        !selectedSecretaria ||
        String(user.secretaria_id) === selectedSecretaria

    return matchesSearch && matchesSecretaria
    })

  return (
    <Box px={6} py={6}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Flex
        align="flex-end"
        justify="space-between"
        mb={6}
        flexWrap="wrap"
        gap={4}
        >
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
            Usuários
            </Text>

            <Text fontSize="sm" color={subColor}>
            {filteredUsers.length} usuários cadastrados
            </Text>
        </Box>

        <Flex align="center" gap={3} flexWrap="wrap">
            {/* Secretaria Filter */}
            <NativeSelect.Root size="sm" width="220px">
            <NativeSelect.Field
                value={selectedSecretaria}
                onChange={e => setSelectedSecretaria(e.target.value)}
                bg={bg}
                borderColor={borderColor}
                cursor="pointer"
            >
                <option value="">Todas as secretarias</option>

                {secretarias.map(secretaria => (
                <option
                    key={String(secretaria.id)}
                    value={String(secretaria.id)}
                    style={{
                    backgroundColor: '#111827',
                    color: 'white',
                    }}
                >
                    {secretaria.nome}
                </option>
                ))}
            </NativeSelect.Field>

            <NativeSelect.Indicator />
            </NativeSelect.Root>

            {/* Search */}
            <Flex
            align="center"
            gap={2}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
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
                fontSize="sm"
                placeholder="Pesquisar usuários..."
                _placeholder={{ color: 'gray.400' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                p={0}
                h="auto"
                _focus={{ boxShadow: 'none' }}
            />
            </Flex>

            {/* Add User */}
            <Button
            size="sm"
            colorPalette="blue"
            borderRadius="lg"
            onClick={addNewUser}
            >
            <Plus size={14} />
            Novo usuário
            </Button>
        </Flex>
        </Flex>

        {/* Table */}
        <Box
          bg={bg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="2xl"
          overflow="hidden"
        >
          <Table.Root>
            <Table.Header bg={headerBg}>
              <Table.Row>
                <Table.ColumnHeader>Nome</Table.ColumnHeader>
                <Table.ColumnHeader>Email</Table.ColumnHeader>
                <Table.ColumnHeader>Secretaria</Table.ColumnHeader>

                <Table.ColumnHeader textAlign="right" w="120px">
                  Ações
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {/* New User */}
              {editingId === 'new' && (
                <Table.Row bg="blue.500/5">
                  <Table.Cell>
                    <Input
                      size="sm"
                      value={editedUser?.nome ?? ''}
                      onChange={e => updateField('nome', e.target.value)}
                      placeholder="Nome"
                    />
                  </Table.Cell>

                  <Table.Cell>
                    <Input
                      size="sm"
                      value={String(editedUser?.email) ?? ''}
                      onChange={e => updateField('email', e.target.value)}
                      placeholder="Email"
                    />
                  </Table.Cell>

                  <Table.Cell>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field
                        value={String(editedUser?.secretaria_id ?? '')}
                        onChange={e => updateField('secretaria_id', e.target.value)}
                      >
                        <option value="">Selecione</option>

                        {secretarias.map(secretaria => (
                          <option
                            key={String(secretaria.id)}
                            value={String(secretaria.id)}
                          >
                            {secretaria.nome}
                          </option>
                        ))}
                      </NativeSelect.Field>

                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Table.Cell>

                  <Table.Cell>
                    <Flex justify="flex-end" gap={2}>
                      <IconButton
                        aria-label="Salvar"
                        size="sm"
                        colorPalette="green"
                        onClick={handleSave}
                      >
                        <Check size={14} />
                      </IconButton>

                      <IconButton
                        aria-label="Cancelar"
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        <X size={14} />
                      </IconButton>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              )}

              {/* Existing Users */}
              {filteredUsers.map(user => {
                const isEditing = editingId === user.id

                return (
                  <Table.Row key={String(user.id)}>
                    <Table.Cell>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={editedUser?.nome ?? ''}
                          onChange={e => updateField('nome', e.target.value)}
                        />
                      ) : (
                        <Text fontWeight="500">{user.nome}</Text>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={String(editedUser?.email) ?? ''}
                          onChange={e => updateField('email', e.target.value)}
                        />
                      ) : (
                        <Text fontSize="sm" color={muted}>
                          {String(user.email) ?? ""}
                        </Text>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      {isEditing ? (
                        <NativeSelect.Root size="sm">
                          <NativeSelect.Field
                            value={String(editedUser?.secretaria_id ?? '')}
                            onChange={e =>
                              updateField('secretaria_id', e.target.value)
                            }
                          >
                            {secretarias.map(secretaria => (
                              <option
                                key={String(secretaria.id)}
                                value={String(secretaria.id)}
                              >
                                {secretaria.nome}
                              </option>
                            ))}
                          </NativeSelect.Field>

                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      ) : (
                        <Badge variant="subtle" colorPalette="blue">
                          {getSecretariaName(String(user.secretaria_id) ?? "")}
                        </Badge>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      <Flex justify="flex-end" gap={2}>
                        {isEditing ? (
                          <>
                            <IconButton
                              aria-label="Salvar"
                              size="sm"
                              colorPalette="green"
                              onClick={handleSave}
                            >
                              <Check size={14} />
                            </IconButton>

                            <IconButton
                              aria-label="Cancelar"
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              <X size={14} />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            aria-label="Editar"
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(user)}
                          >
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