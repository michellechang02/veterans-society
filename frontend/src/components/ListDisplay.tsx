import React from "react";
import { Box, VStack, Text, Heading, Divider } from "@chakra-ui/react";


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
      <Box p={4}>
        <Text>No veteran resources found in your area.</Text>
      </Box>
    );
  }
  
  return (
    <Box p={4}>
      <Heading size="md" mb={4} ml={2}>
        Veteran Resources ({resources.length})
      </Heading>
      <VStack spacing={4} align="stretch" divider={<Divider />}>
        {resources.map((resource) => (
          <Box key={resource.id} p={2}>
            <Text fontWeight="bold" fontSize="lg">
              {resource.name}
            </Text>
            <Text color="gray.600" mt={1}>
              {resource.address && resource.address !== 'Address not available' ? resource.address : 'Address not found'}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
