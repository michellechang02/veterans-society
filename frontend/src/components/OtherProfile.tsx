import React, { useState, useEffect } from 'react';
import {
  Box, Text, VStack, Avatar, Center, IconButton,
  Button,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOtherUserData } from '../Api/getData';
import { ArrowLeft } from 'react-feather';
import { useAuth } from '../Auth/Auth';
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

  // Use the otherUsername prop or useParams to get the username
  const { otherUsername: paramUsername } = useParams<{ otherUsername: string }>();
  const usernameToUse = otherUsername || paramUsername;

  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (usernameToUse) {
      getOtherUserData({ 
        username: usernameToUse, 
        setUserData,
        toast: (options) => {
          console.log(options);
        }
      }).finally(() => setIsLoading(false));
    }
  }, [usernameToUse]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Center minHeight="100vh" position="relative">
      <IconButton
        icon={<ArrowLeft />}
        aria-label="Back to Search"
        position="absolute"
        top="50%"
        left="5%"  // Increased margin left
        transform="translateY(-50%)"
        onClick={() => navigate(`/${usernameToUse}/search`)}
      />
      <Box
        p={10}
        shadow="xl"
        width="60%"
        maxWidth="800px"
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        color="black"
        textAlign="center"
      >
        <VStack>
          <Avatar src={userData.profilePic} size="2xl" mb={5} />
          <Text fontWeight="bold" fontSize="3xl">
            {userData.firstName} {userData.lastName}
          </Text>
          <Text fontSize="xl" color="gray.400">{`@${userData.username}`}</Text>
          <Text fontSize="lg" color="gray.500">{userData.email}</Text>
          {isAdmin && (
            <Button
              colorScheme="gray"
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