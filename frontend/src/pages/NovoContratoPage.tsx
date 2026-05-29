import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  NativeSelect,
  Separator,
  Tag,
  Text,
  Textarea,
} from '@chakra-ui/react'

import { FileUp, Loader2, Save } from 'lucide-react'
import { useState } from 'react'

import { useAppData } from '../contexts/ContractContext'
import { useColorModeValue } from '../components/ui/color-mode'
import { API_URL, type NovoContratoForm } from '../types'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../components/ui/app-toaster'
import { findBestMatchEmpresaId, findBestMatchSecretariaId, formatDateToInput } from '../functions'


export default function NovoContrato() {
  const { secretarias, usuarios, empresas, fetchContracts } = useAppData()

  const today = new Date().toISOString().split('T')[0]

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const navigate = useNavigate()

  const [form, setForm] = useState<NovoContratoForm>({
    criado_em: today,
    publicado_ama: false,
    publicado_pncp: false,
  })

  const bg = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const muted = useColorModeValue('gray.500', 'gray.400')
  const headingColor = useColorModeValue('gray.800', 'white')
  const inputBg = useColorModeValue('gray.50', 'gray.800')

  function setField(field: keyof NovoContratoForm, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  /* =========================
     BRL FORMAT HELPERS
  ========================= */

  function formatBRL(value?: string) {
    if (!value) return ''

    const num = Number(value) / 100
    if (isNaN(num)) return ''

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  function parseBRL(value: string) {
    return value.replace(/\D/g, '')
  }

  const requiredFields: (keyof NovoContratoForm)[] = [
    'numero_contrato',
    'objeto',
    'valor_inicial',
    'vigencia_inicio',
    'vigencia_fim',
    'secretaria_id',
    'empresa_id',
    'legislacao',
  ]

  const isFormValid = requiredFields.every(field => {
    const v = form[field]
    return v !== undefined && v !== null && String(v).trim() !== ''
  })

  async function handleSave() {
    if (!isFormValid) return

    try {
      await fetch(`${API_URL}/create_contrato`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      await fetchContracts()
      // navigate('/contratos')
      showToast({
        type: "success",
        title: "Novo contrato criado com sucesso!",
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "Erro criando contrato",
      })
    }
  }

  async function autoComplete(file: File) {
    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("arquivo", file)

      const response = await fetch("https://controle-contratos-n8n-contratos.a9vwt7.easypanel.host/webhook/processar-contrato", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        showToast({
          type: "error",
          title:"Error ao processar arquivo",
        })
        // throw new Error("Erro ao processar ficheiro")
      }

      const data = await response.json()

      console.log("n8n result:", data)

      // fill simple fields directly
      setForm(prev => ({
        ...prev,
        numero_contrato: data.numero_contrato,
        objeto: data.objeto,
        valor_inicial: String(data.valor_inicial ?? ""),
        vigencia_inicio: formatDateToInput(data.vigencia_inicio),
        vigencia_fim: formatDateToInput(data.vigencia_fim),
        assinado_em: formatDateToInput(data.assinado_em),
        legislacao: data.legislacao,
      }))

      // fuzzy match for relations
      const empresaId = findBestMatchEmpresaId(data.empresa, empresas)
      const secretariaId = findBestMatchSecretariaId(data.secretaria, secretarias)

      setForm(prev => ({
        ...prev,
        empresa_id: empresaId ?? "",
        secretaria_id: secretariaId ?? "",
      }))

    } catch (err) {
      console.error(err)
      showToast({
        type: "error",
        title: "Erro ao processar arquivo",
        description: "Não foi possível extrair os dados do documento",
      })
    } finally {
      showToast({
        type: "success",
        title: "Arquivo processado com sucesso!",
      })
      setIsUploading(false)
    }
  }

  const Label = ({
    children,
    required,
  }: {
    children: React.ReactNode
    required?: boolean
  }) => (
    <Flex mb={2} align="center" gap={1}>
      <Text fontSize="sm" fontWeight="600">
        {children}
      </Text>
      {required && <Text color="red.500">*</Text>}
    </Flex>
  )

  return (
    <Box px={6} py={6}>
      <Box maxW="1400px" mx="auto">

        {/* Header */}
        <Flex justify="space-between" align="flex-end" mb={8}>
          <Box>
            <Text fontSize="3xl" fontWeight="700" color={headingColor}>
              Novo Contrato
            </Text>
          </Box>
        </Flex>

        <Box bg={bg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={6}>

          {/* Upload */}
          <Box mb={6}>
            <Text fontSize="sm" fontWeight="600" mb={2}>
              Documento do contrato
            </Text>

            <Flex
              as="label"
              border="2px dashed"
              borderColor={isUploading ? 'blue.500' : borderColor}
              borderRadius="xl"
              p={6}
              align="center"
              justify="center"
              direction="column"
              gap={3}
              cursor={isUploading ? 'not-allowed' : 'pointer'}
              opacity={isUploading ? 0.75 : 1}
              transition="0.2s"
              _hover={{ borderColor: 'blue.500' }}
            >
              {/* ICON STATE */}
              {isUploading ? (
                <Loader2
                  size={28}
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
              ) : (
                <FileUp size={28} />
              )}

              {/* TEXT STATE */}
              <Text fontSize="sm" color={muted} textAlign="center">
                {isUploading
                  ? 'Processando documento...'
                  : uploadedFile
                  ? `Arquivo: ${uploadedFile.name}`
                  : 'Upload para auto preenchimento'}
              </Text>

              {/* FILE INPUT */}
              <Input
                type="file"
                hidden
                disabled={isUploading}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  setUploadedFile(file)
                  await autoComplete(file)
                }}
              />
            </Flex>
          </Box>

          <Separator mb={6} />

          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>

            {/* Número */}
            <Box>
              <Label required>Número do contrato</Label>
              <Input
                bg={inputBg}
                value={form.numero_contrato ?? ''}
                placeholder='000/2026'
                onChange={e => setField('numero_contrato', e.target.value)}
              />
            </Box>

            {/* Legislação */}
            <Box>
              <Label required>Legislação</Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={String(form.legislacao ?? '')}
                  onChange={e => setField('legislacao', e.target.value)}
                  cursor="pointer"
                >
                  <option value="">Selecionar...</option>
                  <option value="14.133">14.133</option>
                  <option value="8.666">8.666</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>

            {/* Objeto */}
            <Box gridColumn="1 / -1">
              <Label required>Objeto</Label>
              <Textarea
                bg={inputBg}
                value={form.objeto ?? ''}
                onChange={e => setField('objeto', e.target.value)}
                placeholder='Descrição'
              />
            </Box>

            {/* Valor (BRL) */}
            <Box>
              <Label required>Valor inicial</Label>
              <Input
                bg={inputBg}
                value={formatBRL(form.valor_inicial)}
                onChange={e =>
                  setField('valor_inicial', parseBRL(e.target.value))
                }
                placeholder="R$ 0,00"
              />
            </Box>

            {/* Secretaria */}
            <Box>
              <Label required>Secretaria</Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={String(form.secretaria_id ?? '')}
                  onChange={e => setField('secretaria_id', e.target.value)}
                  cursor="pointer"
                >
                  <option value="">Selecionar...</option>
                  {secretarias.map(s => (
                    <option key={s.id} value={String(s.id)}>
                      {s.nome}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>

            {/* Empresa */}
            <Box>
              <Label required>Empresa</Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={String(form.empresa_id ?? '')}
                  onChange={e => setField('empresa_id', e.target.value)}
                  cursor="pointer"
                >
                  <option value="">Selecionar...</option>
                  {empresas.map(e => (
                    <option key={e.id} value={String(e.id)}>
                      {e.razao_social}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>

            {/* Gestor */}
            <Box>
              <Label>Gestor</Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={String(form.gestor_id ?? '')}
                  onChange={e => setField('gestor_id', e.target.value)}
                  cursor="pointer"
                >
                  <option value="">Selecionar...</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={String(u.id)}>
                      {u.nome}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>

            {/* Fiscais */}
            <Box>
              <Label>Fiscais</Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value=""
                  onChange={e => {
                    const id = Number(e.target.value)
                    if (!id) return
                    if (!form.fiscais?.includes(id)) {
                      setField('fiscais', [...(form.fiscais ?? []), id])
                    }
                  }}
                  cursor="pointer"
                >
                  <option value="">Adicionar fiscal...</option>
                  {usuarios
                    .filter(u => !form.fiscais?.includes(Number(u.id)))
                    .map(u => (
                      <option key={u.id} value={String(u.id)}>
                        {u.nome}
                      </option>
                    ))}
                </NativeSelect.Field>
              </NativeSelect.Root>

              {/* Selected fiscais tags */}
              {form.fiscais && form.fiscais.length > 0 && (
                <Flex gap="2" mt="2" wrap="wrap">
                  {form.fiscais?.map(id => {
                    const usuario = usuarios.find(u => u.id === id)
                    return (
                      <Tag.Root key={id} size="md" variant="subtle">
                        <Tag.Label>{usuario?.nome ?? id}</Tag.Label>
                        <Tag.EndElement>
                          <Tag.CloseTrigger
                            onClick={() =>
                              setField('fiscais', form.fiscais?.filter(f => f !== id))
                            }
                          />
                        </Tag.EndElement>
                      </Tag.Root>
                    )
                  })}
                </Flex>
              )}
            </Box>      
            {/* Dates */}
            {/* <Box>
              <Label required>Criado em</Label>
              <Input
                type="date"
                value={form.criado_em ?? ''}
                onChange={e => setField('criado_em', e.target.value)}
              />
            </Box> */}

            <Box>
              <Label required>Assinado em</Label>
              <Input
                type="date"
                value={form.assinado_em ?? ''}
                onChange={e => setField('assinado_em', e.target.value)}
                cursor="pointer"
              />
            </Box>

            <Box>
              <Label required>Vigência início</Label>
              <Input
                type="date"
                value={form.vigencia_inicio ?? ''}
                max={form.vigencia_fim ?? undefined}
                onChange={e => setField('vigencia_inicio', e.target.value)}
                cursor="pointer"
              />
            </Box>

            <Box>
              <Label required>Vigência fim</Label>
              <Input
                type="date"
                value={form.vigencia_fim ?? ''}
                min={form.vigencia_inicio ?? undefined}
                onChange={e => setField('vigencia_fim', e.target.value)}
                cursor="pointer"
              />
            </Box>

          </Grid>

          <Separator my={6} />

          <Button
            colorPalette="blue"
            disabled={!isFormValid}
            onClick={handleSave}
          >
            <Save size={16} />
            Salvar contrato
          </Button>

        </Box>
      </Box>
    </Box>
  )
}