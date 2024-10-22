import { Box, Text } from '@chakra-ui/react'

type Props = {}

function Post({}: Props) {
  return (
    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
    <Text fontWeight="bold">Post Title 1</Text>
    <Text mt={2}>This is a description of the first post.</Text>
  </Box>
  )
}

export default Post