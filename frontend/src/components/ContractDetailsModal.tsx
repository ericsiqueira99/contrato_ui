import { useState } from 'react'
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  Input,
  NativeSelect,
  Portal,
  Separator,
  Text,
  Checkbox,
} from '@chakra-ui/react'
import { Pencil, X, Check } from 'lucide-react'
import { useColorModeValue } from './ui/color-mode'
import { API_URL, type Contract } from '../types'
import { useAppData } from '../contexts/ContractContext'

type Props = {
  contract: Contract
  children: React.ReactNode
}

function formatCurrency(value?: number | string) {
  if (!value) return null
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

function formatDate(date?: string) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

function toInputDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toISOString().split('T')[0]
}

function InfoItem({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const valueColor = useColorModeValue('gray.800', 'white')
  return (
    <Box>
      <Text fontSize="xs" color={labelColor} mb={1} textTransform="uppercase" letterSpacing="0.5px">
        {label}
      </Text>
      <Text fontSize="sm" color={valueColor} fontWeight="500" wordBreak="break-word">
        {value !== undefined && value !== null && value !== '' ? String(value) : '—'}
      </Text>
    </Box>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  return (
    <Text fontSize="xs" color={labelColor} mb={1} textTransform="uppercase" letterSpacing="0.5px">
      {children}
    </Text>
  )
}

export default function ContractDetailsModal({ contract, children }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Contract>({ ...contract })

  // Type-safe field updater — avoids the index signature mismatch
  function setField<K extends keyof Contract>(key: K, value: Contract[K]) {
    setForm(prev => ({ ...prev, [key]: value } as Contract))
  }

  const { secretarias, usuarios, empresas, fetchContracts } = useAppData()

  const titleColor = useColorModeValue('gray.800', 'white')
  const metaColor = useColorModeValue('gray.500', 'gray.400')
  const dividerColor = useColorModeValue('gray.100', 'gray.700')
  const modalBg = useColorModeValue('white', 'gray.900')
  const sectionBg = useColorModeValue('gray.50', 'gray.800')
  const inputBg = useColorModeValue('white', 'gray.900')
  const inputBorder = useColorModeValue('gray.200', 'gray.600')
  const footerBg = useColorModeValue('gray.50', 'gray.950')

  const inputStyles = {
    bg: inputBg,
    border: '1px solid',
    borderColor: inputBorder,
    borderRadius: 'md',
    fontSize: 'sm',
    _focus: { borderColor: 'blue.500', boxShadow: 'none' },
  }

  async function handleSave() {
    console.log(form)
    try {
        await fetch(
        `${API_URL}/update_contract/${form.id}`,
        {
            method: 'POST',
            headers: {
            'Content-Type':
                'application/json',
            },
            body: JSON.stringify(form),
        }
        )

        await fetchContracts()

        setIsEditing(false)
    } catch (err) {
        console.error(err)
    }
  }

  function handleCancel() {
    setForm({ ...contract })
    setIsEditing(false)
  }

  const data = isEditing ? form : contract

  return (
    <Dialog.Root size="xl" placement="center">
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop backdropFilter="blur(6px)" />
        <Dialog.Positioner>
          <Dialog.Content bg={modalBg} borderRadius="2xl" overflow="hidden" mx={4}>

            {/* Header */}
            <Dialog.Header borderBottom="1px solid" borderColor={dividerColor} pb={4}>
              <Flex justify="space-between" align="start" gap={4}>
                <Box flex={1}>
                  {isEditing ? (
                    <>
                      <FieldLabel>Objeto</FieldLabel>
                      <Input
                        {...inputStyles}
                        value={String(form.objeto ?? '')}
                        onChange={e => setField('objeto', e.target.value)}
                        fontSize="xl"
                        fontWeight="700"
                        mb={2}
                      />
                      <FieldLabel>Número do Contrato</FieldLabel>
                      <Input
                        {...inputStyles}
                        value={String(form.numero_contrato ?? '')}
                        onChange={e => setField('numero_contrato', e.target.value)}
                        fontSize="sm"
                      />
                    </>
                  ) : (
                    <>
                      <Dialog.Title fontSize="xl" fontWeight="700" color={titleColor} lineHeight="1.2">
                        {data.objeto}
                      </Dialog.Title>
                      {data.numero_contrato && (
                        <Text mt={2} fontSize="sm" color={metaColor}>
                          Contrato nº {data.numero_contrato}
                        </Text>
                      )}
                    </>
                  )}
                </Box>

                {/* Top-right: edit button + close */}
                <Flex align="center" gap={2} flexShrink={0}>
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorPalette="gray"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil size={14} />
                      Editar
                    </Button>
                  )}
                  <Dialog.CloseTrigger asChild>
                    <CloseButton />
                  </Dialog.CloseTrigger>
                </Flex>
              </Flex>
            </Dialog.Header>

            <Separator borderColor={dividerColor} />

            {/* Body */}
            <Dialog.Body py={6}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>

                {/* Valor Inicial */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ? (
                    <>
                      <FieldLabel>Valor Inicial</FieldLabel>
                      <Input
                        {...inputStyles}
                        type="number"
                        step="0.01"
                        value={String(form.valor_inicial ?? '')}
                        onChange={e => setField('valor_inicial', e.target.value)}
                      />
                    </>
                  ) : (
                    <InfoItem label="Valor Inicial" value={formatCurrency(data.valor_inicial)} />
                  )}
                </Box>

                {/* Criado em */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ? (
                    <>
                      <FieldLabel>Criado em</FieldLabel>
                      <Input
                        {...inputStyles}
                        type="date"
                        value={toInputDate(String(form.criado_em ?? ''))}
                        max={toInputDate(String(form.vigencia_inicio ?? ''))}
                        onChange={e => setField('criado_em', e.target.value)}
                      />
                    </>
                  ) : (
                    <InfoItem label="Criado em" value={formatDate(String(data.criado_em ?? ''))} />
                  )}
                </Box>

                {/* Vigência Inicial */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ? (
                    <>
                      <FieldLabel>Vigência Inicial</FieldLabel>
                      <Input
                        {...inputStyles}
                        type="date"
                        value={toInputDate(String(form.vigencia_inicio ?? ''))}
                        min={toInputDate(String(form.criado_em ?? ''))}
                        max={toInputDate(String(form.vigencia_fim ?? ''))}
                        onChange={e => setField('vigencia_inicio', e.target.value)}
                      />
                    </>
                  ) : (
                    <InfoItem label="Vigência Inicial" value={formatDate(String(data.vigencia_inicio ?? ''))} />
                  )}
                </Box>

                {/* Vigência Final */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ? (
                    <>
                      <FieldLabel>Vigência Final</FieldLabel>
                      <Input
                        {...inputStyles}
                        type="date"
                        value={toInputDate(String(form.vigencia_fim ?? ''))}
                        min={toInputDate(String(form.vigencia_inicio ?? ''))}
                        onChange={e => setField('vigencia_fim', e.target.value)}
                      />
                    </>
                  ) : (
                    <InfoItem label="Vigência Final" value={formatDate(String(data.vigencia_fim ?? ''))} />
                  )}
                </Box>

                {/* Secretaria */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ? (
                    <>
                      <FieldLabel>Secretaria</FieldLabel>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          {...inputStyles}
                          value={String(form.secretaria_id ?? '')}
                          onChange={e => setField('secretaria_id', Number(e.target.value))}
                          cursor="pointer"
                        >
                          <option value="">Selecionar...</option>
                          {secretarias.map(s => (
                            <option key={s.id} value={String(s.id)}>{s.nome}</option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </>
                  ) : (
                    <InfoItem
                      label="Secretaria"
                      value={secretarias.find(s => String(s.id) === String(data.secretaria_id))?.nome ?? '—'}
                    />
                  )}
                </Box>

                {/* Empresa */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ? (
                    <>
                      <FieldLabel>Empresa</FieldLabel>
                      <NativeSelect.Root >
                        <NativeSelect.Field
                          {...inputStyles}
                          value={String(form.empresa_id ?? '')}
                          onChange={e => setField('empresa_id', Number(e.target.value))}
                          cursor="pointer"
                        >
                          <option value="">Selecionar...</option>
                          {empresas.map(e => (
                            <option key={e.id} value={String(e.id)}>{e.razao_social}</option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </>
                  ) : (
                    <InfoItem
                      label="Empresa"
                      value={empresas.find(e => String(e.id) === String(data.empresa_id))?.razao_social ?? '—'}
                    />
                  )}
                </Box>

                {/* Gestor */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ? (
                    <>
                      <FieldLabel>Gestor</FieldLabel>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          {...inputStyles}
                          value={String(form.gestor_id ?? '')}
                          onChange={e => setField('gestor_id', Number(e.target.value))}
                          cursor="pointer"
                        >
                          <option value="">Selecionar...</option>
                          {usuarios.map(u => (
                            <option key={u.id} value={String(u.id)}>{u.nome}</option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </>
                  ) : (
                    <InfoItem
                      label="Gestor"
                      value={usuarios.find(u => String(u.id) === String(data.gestor_id))?.nome ?? '—'}
                    />
                  )}
                </Box>

                {/* Legislação */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ? (
                    <>
                      <FieldLabel>Legislação</FieldLabel>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          {...inputStyles}
                          value={String(form.legislacao ?? '')}
                          onChange={(e) => {
                            const value = e.target.value

                            setField('legislacao', value)

                            if (value === '8.666') {
                                setField('publicado_pncp', null)
                            }
                            else{
                                setField('publicado_pncp', false)
                            }
                            }}
                          cursor="pointer"
                        >
                            <option value="">Selecionar...</option>
                            <option key={1} value={String(14.133)}>{14.133}</option>
                            <option key={2} value={String(8.666)}>{8.666}</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </>
                  ) : (
                    <InfoItem label="Legislação" value={data.legislacao} />
                  )}
                </Box>

                {/* Publicado AMA */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ?  (
                    <>
                      <FieldLabel>Publicado AMA</FieldLabel>
                      <Checkbox.Root
                        checked={Boolean(form.publicado_ama)}
                        onCheckedChange={e => setField('publicado_ama', !!e.checked)}
                        mt={1}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label fontSize="sm">Publicado no AMA</Checkbox.Label>
                      </Checkbox.Root>
                    </>
                  ) : (
                    <InfoItem label="Publicado AMA" value={data.publicado_ama ? 'Sim' : 'Não'} />
                  )}
                </Box>

                {/* Publicado PNCP */}
                <Box p={4} borderRadius="xl" bg={sectionBg}>
                  {isEditing ? (
                    form.legislacao !== '8.666' && (
                        <>
                        <FieldLabel>
                            Publicado PNCP
                        </FieldLabel>

                        <Checkbox.Root
                            checked={Boolean(form.publicado_pncp)}
                            onCheckedChange={(e) =>
                            setField(
                                'publicado_pncp',
                                !!e.checked
                            )
                            }
                            mt={1}
                        >
                            <Checkbox.HiddenInput />

                            <Checkbox.Control />

                            <Checkbox.Label fontSize="sm">
                            Publicado no PNCP
                            </Checkbox.Label>
                        </Checkbox.Root>
                        </>
                    )
                    ) : (
                    form.legislacao !== '8.666' && (
                        <InfoItem
                        label="Publicado PNCP"
                        value={
                            data.publicado_pncp
                            ? 'Sim'
                            : 'Não'
                        }
                        />
                    )
                    )}
                </Box>

              </Grid>
            </Dialog.Body>

            {/* Footer — only shown when editing */}
            {isEditing && (
              <>
                <Separator borderColor={dividerColor} />
                <Box px={6} py={4} bg={footerBg}>
                  <Flex justify="flex-end" gap={3}>
                    <Button variant="ghost" colorPalette="gray" onClick={handleCancel}>
                      <X size={14} />
                      Cancelar
                    </Button>
                    <Button colorPalette="blue" onClick={handleSave}>
                      <Check size={14} />
                      Salvar alterações
                    </Button>
                  </Flex>
                </Box>
              </>
            )}

          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}