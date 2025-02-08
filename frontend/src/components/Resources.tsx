import React, { useState, useEffect } from "react";
import { Box, Flex, Text, useToast } from "@chakra-ui/react";
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
  const toast = useToast();

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
            setIsLoading(false);

            // Show success toast if resources were found
            if (veteranResources.length > 0) {
              toast({
                title: "Resources Found",
                description: `Found ${veteranResources.length} veteran resources in your area.`,
                status: "success",
                duration: 5000,
                isClosable: true,
              });
            } else {
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
  }, [toast]);

  if (isLoading) {
    return (
      <Box p={4}>
        <Text>Loading veteran resources...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Flex
      h="calc(100vh - 64px)" // Adjust based on your navbar height
      direction={{ base: "column", md: "row" }}
    >
      {/* List Display (Left Side) */}
      <Box flex="1" borderRight="1px" borderColor="gray.200" overflowY="auto">
        <ListDisplay resources={resources} />
      </Box>

      {/* Map Display (Right Side) */}
      <Box flex="2">
        {userLocation && (
          <MapDisplay resources={resources} userLocation={userLocation} />
        )}
      </Box>
    </Flex>
  );
};

export default Resources;
