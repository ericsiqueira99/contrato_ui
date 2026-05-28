import {
  Box,
  Text,
  Badge,
  Flex,
  Separator,
} from '@chakra-ui/react'

import {
  Calendar,
  FileSignature,
} from 'lucide-react'
import type { Contract } from '../types'
import { useColorModeValue } from './ui/color-mode'
import ContractDetailsModal from './ContractDetailsModal'
import { useAppData } from '../contexts/ContractContext'



type Props = {
  contract: Contract
}


export default function ContractCard({
  contract,
}: Props) {
  const {
    publicado_ama,
    publicado_pncp,
    vigencia_fim,
    secretaria_id,
    numero_contrato,
    objeto,
    legislacao,
  } = contract

  const cardBg = useColorModeValue(
    'white',
    'gray.900'
  )

  const cardBorder = useColorModeValue(
    'gray.200',
    'gray.700'
  )

  const titleColor = useColorModeValue(
    'gray.800',
    'white'
  )

  const metaColor = useColorModeValue(
    'gray.500',
    'gray.400'
  )

  const iconBg = useColorModeValue(
    'blue.50',
    'blue.950'
  )

  const dividerColor = useColorModeValue(
    'gray.100',
    'gray.700'
  )

  const {secretarias,} = useAppData()

  return (
    <ContractDetailsModal contract={contract}>
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        borderRadius="xl"
        p={4}
        _hover={{
          borderColor: 'blue.500',
          transform: 'translateY(-2px)',
          shadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
        transition="all 0.2s"
        cursor="pointer"
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align="flex-start"
          mb={3}
        >
          <Flex
            align="center"
            gap={2}
            flex={1}
            mr={2}
          >
            <Box
              w="32px"
              h="32px"
              bg={iconBg}
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <FileSignature
                size={15}
                color="#60a5fa"
              />
            </Box>

            <Text
              fontWeight="600"
              fontSize="sm"
              color={titleColor}
              lineClamp={2}
              fontFamily="'DM Serif Display', serif"
            >
              {numero_contrato}
            </Text>
          </Flex>

          {secretaria_id && secretarias && (
          <Text
            fontSize="xs"
            color={metaColor}
            lineClamp={2}
            mb={3}
          >
            {
              secretarias.find(
                (s) => String(s.id) === String(secretaria_id)
              )?.nome ?? '—'
            }
          </Text>
        )}
        </Flex>


        {/* Contract Description */}
        {objeto && (
          <Text
            fontSize="xs"
            color={metaColor}
            lineClamp={2}
            mb={3}
          >
            {objeto}
          </Text>
        )}

        

        <Separator
          borderColor={dividerColor}
          mb={3}
        />

        {/* Footer */}
        <Flex
          justify="space-between"
          align="center"
        >
          <Flex align="center" gap={1}>
            <Calendar
              size={11}
              color="#6b7280"
            />

            <Text
              fontSize="xs"
              color={metaColor}
            >
              {vigencia_fim
                ? new Date(
                    vigencia_fim
                  ).toLocaleDateString('pt-BR')
                : '—'}
            </Text>
          </Flex>

          <Flex gap={2} align="center">
            {publicado_ama !== undefined  && (
              <Badge
                size="sm"
                colorPalette={
                  publicado_ama ? 'green' : 'red'
                }
                variant="subtle"
              >
                AMA
              </Badge>
            )}

            {(publicado_pncp !== undefined && legislacao !== '8.666') && (
              <Badge
                size="sm"
                colorPalette={
                  publicado_pncp ? 'green' : 'red'
                }
                variant="subtle"
              >
                PNCP
              </Badge>
            )}
          </Flex>
        </Flex>
      </Box>
    </ContractDetailsModal>
  )
}