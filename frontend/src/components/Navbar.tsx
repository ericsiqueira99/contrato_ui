import { Box, Flex, Text, HStack } from '@chakra-ui/react'
import { ColorModeButton, useColorModeValue } from './ui/color-mode'
import { NavLink } from 'react-router-dom'
import { FileText, User, Building2, Factory, FileBadge } from 'lucide-react'

const navItems = [
  { label: 'Contratos', path: '/contratos', icon: FileText },
  { label: 'Servidores', path: '/usuarios', icon: User },
  { label: 'Secretarias', path: '/secretarias', icon: Building2 },
  { label: 'Empresas', path: '/empresas', icon: Factory },
  { label: 'Novo Contrato', path: '/novoContrato', icon: FileBadge },
]

export default function Navbar() {
  const bg = useColorModeValue('white', 'gray.950')
  const border = useColorModeValue('gray.200', 'gray.800')
  const brandColor = useColorModeValue('gray.900', 'white')
  const linkColor = useColorModeValue('gray.600', 'gray.400')
  const linkHoverBg = useColorModeValue('gray.100', 'gray.800')

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={100}
      bg={bg}
      borderBottom="1px solid"
      borderColor={border}
      px={8}
      py={0}
      h="60px"
      transition="background 0.2s"
    >
      <Flex h="full" align="center" justify="space-between" maxW="1400px" mx="auto">

        {/* Left — brand */}
        <Flex align="center" gap={3}>
          <Box
            w="28px" h="28px"
            bg="blue.500"
            borderRadius="6px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FileText size={15} color="white" />
          </Box>
          <Text
            fontFamily="'DM Serif Display', serif"
            fontSize="xl"
            fontWeight="600"
            color={brandColor}
            letterSpacing="-0.02em"
          >
            Contratos<Text as="span" color="blue.400">UI</Text>
          </Text>
        </Flex>

        {/* Right — nav links + color mode toggle */}
        <HStack gap={1}>
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <Flex
                  align="center" gap={2}
                  px={4} py={2}
                  borderRadius="md"
                  bg={isActive ? 'blue.500' : 'transparent'}
                  color={isActive ? 'white' : linkColor}
                  _hover={{ bg: isActive ? 'blue.500' : linkHoverBg, color: isActive ? 'white' : brandColor }}
                  transition="all 0.15s"
                  cursor="pointer"
                  fontSize="sm"
                  fontWeight="500"
                >
                  <Icon size={15} />
                  <Text>{label}</Text>
                </Flex>
              )}
            </NavLink>
          ))}

          <ColorModeButton />
        </HStack>

      </Flex>
    </Box>
  )
}