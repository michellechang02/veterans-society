import { Box, Checkbox, Grid, Heading, Input, Text, VStack } from '@chakra-ui/react';



const Feed = () => {
  return (
    <Grid
      templateColumns="1fr 2fr 1fr"
      gap={4}
      p={4}
    >
      {/* Left Column: Search Filters */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
        <Heading as="h3" size="md" mb={4}>Search Filters</Heading>
        <VStack spacing={4} align="start">
          <Checkbox>Mental Health</Checkbox>
          <Checkbox>Employment</Checkbox>
          <Checkbox>Substance</Checkbox>
          <Checkbox>Shelter</Checkbox>
        </VStack>
      </Box>

      {/* Middle Column: Input and Feed/Posts */}
      <Box  p={4}>
        <Input placeholder="Search..." mb={4} />
        <VStack spacing={4} align="stretch">
          <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
            <Text fontWeight="bold">Post Title 1</Text>
            <Text mt={2}>This is a description of the first post.</Text>
          </Box>
          <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
            <Text fontWeight="bold">Post Title 2</Text>
            <Text mt={2}>This is a description of the second post.</Text>
          </Box>
          <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
            <Text fontWeight="bold">Post Title 3</Text>
            <Text mt={2}>This is a description of the third post.</Text>
          </Box>
        </VStack>
      </Box>

      {/* Right Column: User Info and Goals */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
        <Text fontWeight="bold" fontSize="lg" mb={4}>Hi [user]!</Text>
        <Heading as="h4" size="md" mb={4}>Today's Goals</Heading>

        {/* Exercise Goals */}
        <Text fontWeight="bold" mb={2}>Exercise:</Text>
        <VStack spacing={2} align="start">
          <Checkbox>goal 1</Checkbox>
          <Checkbox>goal 2</Checkbox>
          <Checkbox>goal 3</Checkbox>
          <Checkbox>goal 4</Checkbox>
          <Checkbox>goal 5</Checkbox>
        </VStack>

        {/* Nutrition Goals */}
        <Text fontWeight="bold" mt={4} mb={2}>Nutrition:</Text>
        <VStack spacing={2} align="start">
          <Checkbox>goal 1</Checkbox>
          <Checkbox>goal 2</Checkbox>
        </VStack>
      </Box>
    </Grid>
  );
}

export default Feed;
