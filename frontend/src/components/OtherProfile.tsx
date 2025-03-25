import React, { useState, useEffect } from 'react';
import {
  Box, Text, VStack, Avatar, Center, IconButton, Button, Badge,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOtherUserData } from '../Api/getData';
import { ArrowLeft } from 'react-feather';
import { useAuth } from '../Auth/Auth'; // Import auth hook to check admin status

interface OtherProfileProps {
  otherUsername?: string;
}

const OtherProfile: React.FC<OtherProfileProps> = ({ otherUsername }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    interests: [],
    employmentStatus: '',
    workLocation: '',
    liveLocation: '',
    isVeteran: false,
    weight: 0,
    height: 0,
    profilePic: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const { otherUsername: paramUsername } = useParams<{ otherUsername: string }>();
  const usernameToUse = otherUsername || paramUsername;
  const navigate = useNavigate();
  const { isAdmin } = useAuth(); // Assuming useAuth() provides admin status

  useEffect(() => {
    if (usernameToUse) {
      getOtherUserData({
        username: usernameToUse,
        setUserData,
        toast: (options) => {
          console.log(options);
        },
      }).finally(() => setIsLoading(false));
    }
  }, [usernameToUse]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Center minHeight="100vh" position="relative" bg="gray.50">
      <IconButton
        icon={<ArrowLeft />}
        aria-label="Back to Search"
        position="absolute"
        top="50%"
        left="5%"
        transform="translateY(-50%)"
        bg="white"
        color="black"
        shadow="md"
        _hover={{ bg: "gray.100" }}
        onClick={() => navigate(`/${usernameToUse}/search`)}
      />
      <Box
        p={8}
        shadow="md"
        width="60%"
        maxWidth="800px"
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        color="black"
        textAlign="center"
        transition="all 0.3s"
        _hover={{ shadow: "lg" }}
      >
        <VStack spacing={6}>
          <Avatar 
            src={userData.profilePic} 
            size="2xl" 
            mb={4}
            border="2px solid"
            borderColor="gray.200"
          />
          <Text fontWeight="bold" fontSize="3xl">
            {userData.firstName} {userData.lastName}
          </Text>
          {userData.isVeteran ? (
            <Badge 
              bg="white"
              color="black"
              border="1px solid"
              borderColor="gray.300"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
            >
              Veteran
            </Badge>
          ) : (
            <Badge 
              bg={isAdmin ? "black" : "gray.500"}
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
            >
              {isAdmin ? "admin" : "veteran"}
            </Badge>
          )}
          <Text fontSize="xl" color="gray.500">{`@${userData.username}`}</Text>
          <Text fontSize="md" color="gray.500">{userData.email}</Text>
          {userData.phoneNumber && (
            <Text fontSize="md" color="gray.500">{userData.phoneNumber}</Text>
          )}

          {isAdmin && (
            <Button
              mt={3}
              colorScheme="gray"
              bg="black"
              color="white"
              _hover={{ bg: "gray.700" }}
              onClick={() => navigate(`/${usernameToUse}/fitness/admin_view`)}
            >
              Manage Tasks
            </Button>
          )}
        </VStack>
      </Box>
    </Center>
  );
};

export default OtherProfile;
