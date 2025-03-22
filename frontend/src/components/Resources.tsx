import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Flex, Text, useToast, Spinner, Center, VStack } from "@chakra-ui/react";
import { getVeteranResources } from "../Api/getData";
import { MapDisplay } from "./MapDisplay";
import { ListDisplay } from "./ListDisplay";

interface VeteranResource {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<VeteranResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const resourcesRef = useRef<VeteranResource[]>([]);
  const toast = useToast();
  const checkAddressesTimer = useRef<number | null>(null);

  // Function to check if addresses have been updated
  const checkForAddressUpdates = useCallback(() => {
    if (resourcesRef.current.length > 0) {
      // Deep comparison would be better, but for simplicity let's check if any addresses changed
      let hasUpdates = false;
      
      if (resources.length !== resourcesRef.current.length) {
        hasUpdates = true;
        console.log('Resource array length changed, updating UI');
      } else {
        for (let i = 0; i < resources.length; i++) {
          // Check if any field changed, not just address
          if (
            resources[i].address !== resourcesRef.current[i].address ||
            resources[i].id !== resourcesRef.current[i].id ||
            resources[i].name !== resourcesRef.current[i].name
          ) {
            hasUpdates = true;
            console.log(`Resource at index ${i} changed:`, {
              old: { 
                name: resources[i].name,
                address: resources[i].address
              },
              new: {
                name: resourcesRef.current[i].name,
                address: resourcesRef.current[i].address
              }
            });
            break;
          }
        }
      }
      
      if (hasUpdates) {
        console.log('Updating Resources state with new values');
        // Create a deep copy of resourcesRef.current
        const newResources = resourcesRef.current.map(r => ({...r}));
        setResources(newResources);
      }
    }
  }, [resources]);

  // Set up an interval to update the UI with any address changes
  useEffect(() => {
    // Clear any existing timer
    if (checkAddressesTimer.current) {
      window.clearInterval(checkAddressesTimer.current);
    }
    
    // Set a new timer
    checkAddressesTimer.current = window.setInterval(() => {
      checkForAddressUpdates();
    }, 500); // Check more frequently (every 500ms)
    
    return () => {
      if (checkAddressesTimer.current) {
        window.clearInterval(checkAddressesTimer.current);
        checkAddressesTimer.current = null;
      }
    };
  }, [checkForAddressUpdates]);

  useEffect(() => {
    // Get user's location when component mounts
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserLocation(location);

          try {
            const veteranResources = await getVeteranResources(
              location.lat,
              location.lon
            );
            setResources(veteranResources);
            resourcesRef.current = veteranResources; // Store in ref for background updates
            setIsLoading(false);

            // Show toast if no resource was found
            if (veteranResources.length == 0) {
              toast({
                title: "No Resources Found",
                description:
                  "No veteran resources found in your immediate area. Try again later or contact VA support for assistance.",
                status: "info",
                duration: 5000,
                isClosable: true,
              });
            }
          } catch (error) {
            console.error("Failed to fetch veteran resources:", error);
            setError(
              "Failed to fetch veteran resources. Please try again later."
            );
            setIsLoading(false);
            toast({
              title: "Error",
              description:
                "Failed to fetch veteran resources. Please try again later.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError(
            "Location access denied. Please enable location services to find nearby veteran resources."
          );
          setIsLoading(false);
          toast({
            title: "Location Access Denied",
            description:
              "Please enable location services to find nearby veteran resources.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      toast({
        title: "Browser Not Supported",
        description: "Geolocation is not supported by your browser.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    
    return () => {
      // Cleanup interval when component unmounts
      if (checkAddressesTimer.current) {
        window.clearInterval(checkAddressesTimer.current);
        checkAddressesTimer.current = null;
      }
    };
  }, [toast]);

  if (isLoading) {
    return (
      <Center h="calc(100vh - 64px)" bg="white">
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="black"
            size="xl"
          />
          <Text fontSize="lg" fontWeight="medium" color="gray.700">
            Loading veteran resources...
          </Text>
          <Text fontSize="sm" color="gray.500">
            Finding services near your location
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="white">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Flex
      h="calc(100vh - 64px)"
      direction={{ base: "column", md: "row" }}
      bg="white"
    >
      {/* List Display (Left Side) */}
      <Box 
        flex="1" 
        borderRight="1px" 
        borderColor="gray.200" 
        overflowY="auto"
        bg="white"
      >
        <ListDisplay resources={resources} />
      </Box>

      {/* Map Display (Right Side) */}
      <Box flex="2" position="relative">
        {userLocation && (
          <MapDisplay resources={resources} userLocation={userLocation} />
        )}
      </Box>
    </Flex>
  );
};

export default Resources;
