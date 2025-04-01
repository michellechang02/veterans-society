import React, { useState, useEffect } from 'react';
import {
  Box, Text, VStack, Avatar, Center, IconButton, Button, Badge, useColorModeValue,
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

  const bg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('black', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const iconBgColor = useColorModeValue('white', 'gray.700');
  const iconHoverBg = useColorModeValue('gray.100', 'gray.600');
  const badgeBg = useColorModeValue('white', 'gray.800');
  const badgeColor = useColorModeValue('black', 'white');
  const adminBadgeBg = useColorModeValue('black', 'gray.200');
  const adminBadgeColor = useColorModeValue('white', 'black');
  const veteranBadgeBg = useColorModeValue('gray.500', 'gray.600');

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
    <Center minHeight="100vh" position="relative" bg={bg}>
      <IconButton
        icon={<ArrowLeft />}
        aria-label="Back to Search"
        position="absolute"
        top="50%"
        left="5%"
        transform="translateY(-50%)"
        bg={iconBgColor}
        color={textColor}
        shadow="md"
        _hover={{ bg: iconHoverBg }}
        onClick={() => navigate(`/${usernameToUse}/search`)}
      />
      <Box
        p={8}
        shadow="md"
        width="60%"
        maxWidth="800px"
        borderWidth="1px"
        borderRadius="lg"
        bg={cardBg}
        color={textColor}
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
            borderColor={borderColor}
          />
          <Text fontWeight="bold" fontSize="3xl">
            {userData.firstName} {userData.lastName}
          </Text>
          {userData.isVeteran ? (
            <Badge 
              bg={badgeBg}
              color={badgeColor}
              border="1px solid"
              borderColor={borderColor}
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
              bg={isAdmin ? adminBadgeBg : veteranBadgeBg}
              color={isAdmin ? adminBadgeColor : 'white'}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
            >
              {isAdmin ? "admin" : "veteran"}
            </Badge>
          )}
          <Text fontSize="xl" color={subTextColor}>{`@${userData.username}`}</Text>
          <Text fontSize="md" color={subTextColor}>{userData.email}</Text>
          {userData.phoneNumber && (
            <Text fontSize="md" color={subTextColor}>{userData.phoneNumber}</Text>
          )}

          {isAdmin && (
            <Button
              mt={3}
              colorScheme="gray"
              bg={adminBadgeBg}
              color={adminBadgeColor}
              _hover={{ bg: useColorModeValue('gray.700', 'gray.300') }}
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
