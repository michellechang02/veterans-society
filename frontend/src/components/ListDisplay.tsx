import React from "react";
import { Box, VStack, Text, Heading, Divider, Flex, Badge } from "@chakra-ui/react";


interface VeteranResource {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface ListDisplayProps {
  resources: VeteranResource[];
}


export const ListDisplay: React.FC<ListDisplayProps> = ({ resources }) => {
  if (resources.length === 0) {
    return (
      <Box p={4} bg="white" color="black">
        <Text>No veteran resources found in your area.</Text>
      </Box>
    );
  }
  
  return (
    <Box p={4} bg="white" color="black">
      <Heading size="md" mb={6} ml={2} color="black">
        Veteran Resources <Badge colorScheme="gray" fontSize="sm">({resources.length})</Badge>
      </Heading>
      <VStack spacing={5} align="stretch" divider={<Divider borderColor="gray.300" />}>
        {resources.map((resource) => (
          <Box 
            key={resource.id} 
            p={4} 
            borderRadius="md" 
            boxShadow="sm"
            bg="white"
            _hover={{ bg: "gray.50", transition: "background 0.2s" }}
            cursor="pointer"
          >
            <Flex direction="column">
              <Text fontWeight="bold" fontSize="lg" color="black">
                {resource.name}
              </Text>
              <Text color="gray.500" mt={2} fontSize="sm">
                {resource.address && resource.address !== 'Address not available' ? resource.address : 'Address not found'}
              </Text>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
