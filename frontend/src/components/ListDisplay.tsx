import React from "react";
import { Box, VStack, Text, Heading, Divider, Flex, Badge, useColorModeValue } from "@chakra-ui/react";


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
  // Use color mode values that change based on theme
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("black", "white");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const dividerColor = useColorModeValue("gray.300", "gray.600");

  if (resources.length === 0) {
    return (
      <Box p={4} bg={bgColor} color={textColor}>
        <Text>No veteran resources found in your area.</Text>
      </Box>
    );
  }
  
  return (
    <Box p={4} bg={bgColor} color={textColor}>
      <Heading size="md" mb={6} ml={2}>
        Veteran Resources <Badge colorScheme="gray" fontSize="sm">({resources.length})</Badge>
      </Heading>
      <VStack spacing={5} align="stretch" divider={<Divider borderColor={dividerColor} />}>
        {resources.map((resource) => (
          <Box 
            key={resource.id} 
            p={4} 
            borderRadius="md" 
            boxShadow="sm"
            bg={bgColor}
            _hover={{ bg: hoverBgColor, transition: "background 0.2s" }}
            cursor="pointer"
          >
            <Flex direction="column">
              <Text fontWeight="bold" fontSize="lg">
                {resource.name}
              </Text>
              <Text color={secondaryTextColor} mt={2} fontSize="sm">
                {resource.address && resource.address !== 'Address not available' ? resource.address : 'Address not found'}
              </Text>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
