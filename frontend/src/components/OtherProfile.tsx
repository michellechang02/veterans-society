import React, { useState, useEffect } from 'react';
import {
  Box, Text, VStack, Avatar, Center,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { getOtherUserData } from '../Api/getData';

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
    photoURL: 'https://bit.ly/dan-abramov',
  });

  const [isLoading, setIsLoading] = useState(true);

  // Use the otherUsername prop or useParams to get the username
  const { otherUsername: paramUsername } = useParams<{ otherUsername: string }>();
  const usernameToUse = otherUsername || paramUsername;

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
    <Center minHeight="100vh">
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
        <Avatar src={userData.photoURL} size="2xl" mb={5} />
        <VStack spacing={3}>
          <Text fontWeight="bold" fontSize="3xl">
            {userData.firstName} {userData.lastName}
          </Text>
          <Text fontSize="xl" color="gray.400">{`@${userData.username}`}</Text>
          <Text fontSize="lg" color="gray.500">{userData.email}</Text>
        </VStack>
      </Box>
    </Center>
  );
};

export default OtherProfile;