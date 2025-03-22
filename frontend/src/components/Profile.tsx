import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Text, VStack, HStack, Divider, Stack, IconButton,
  Flex, Spacer, Button, Input, Avatar, Center, useToast,
  Heading, Badge, Container
} from '@chakra-ui/react';
import { Edit, MapPin, Briefcase, Heart, Activity } from 'react-feather';
import { useAuth } from '../Auth/Auth';
import { getUserData } from '../Api/getData';
import { putUserData } from '../Api/putData';
import { PlusCircle } from "react-feather";

const Profile: React.FC = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '', // Password is required
    email: '', // Optional
    phoneNumber: '', // Optional
    interests: [], // Optional, expects an array
    employmentStatus: '', // Optional
    workLocation: '', // Optional
    liveLocation: '', // Optional
    isVeteran: false, // Required
    weight: 0, // Optional, expects Decimal
    height: 0, // Optional, expects Decimal
    profilePic: '', // Optional, expects string
  });

  const { username, authToken } = useAuth();

  const [editableField, setEditableField] = useState<string | null>(null);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data on component mount
  useEffect(() => {
    if (username && authToken) {
      console.log("Fetching user data for:", username);
      getUserData({ 
        username, 
        setUserData, 
        toast,
        checkAdmin: true  // Add this to properly check admin status
      });
    }
  }, [username, toast, authToken]);

  // After data is loaded
  useEffect(() => {
    console.log("User data updated:", userData);
  }, [userData]);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files; // Get all selected files
    if (image && image.length > 0) {
      const newImage = Array.from(image).map((file) => file); // Convert FileList to array of File objects
      putUserData({
        username: username!,
        field: "profilePic",
        value: newImage[0],
        setUserData,
        setEditableField,
        toast,
      });
    }
  };

  const renderField = (field: string, label: string, value: string | number | string[] | null, icon: React.ReactNode) => (
    <Flex direction="row" align="center" p={3} borderRadius="md" bgColor="gray.50" _hover={{ bgColor: "gray.100" }}>
      <Box mr={3} color="gray.500">
        {icon}
      </Box>
      <Box flex="1">
        <Text fontWeight="bold" fontSize="md" color="gray.600">{label}</Text>
        {editableField === field ? (
          <Input
            mt={2}
            type={typeof value === 'number' ? 'number' : 'text'} // Use number input for Decimals
            value={
              Array.isArray(value)
                ? value.join(', ')
                : value !== null
                  ? value.toString() // Convert number or null to string
                  : ''
            }
            onChange={(e) =>
              setUserData((prev) => ({
                ...prev,
                [field]:
                  typeof value === 'number'
                    ? parseFloat(e.target.value) // Convert back to a number for numeric fields
                    : Array.isArray(value)
                      ? e.target.value.split(', ')
                      : e.target.value,
              }))
            }
            bgColor="white"
            borderColor="gray.300"
          />
        ) : (
          <Text fontSize="md" color="gray.800">
            {Array.isArray(value) ? value.join(', ') : value !== null && value !== '' ? value.toString() : 'Not specified'}
          </Text>
        )}
      </Box>
      <Spacer />
      {editableField === field && username ? (
        <HStack spacing={2}>
          <Button
            bgColor="gray.500" 
            color="white"
            size="sm"
            onClick={() => {
              const formattedValue =
                value !== null
                  ? typeof value === 'number'
                    ? value.toString() // Convert number to string
                    : Array.isArray(value)
                      ? value.join(', ') // Join array into a string
                      : value
                  : ''; // Handle null by providing an empty string

              putUserData({
                username,
                field,
                value: formattedValue,
                setUserData,
                setEditableField,
                toast,
              });
            }}
          >
            Save
          </Button>
          <Button size="sm" onClick={() => setEditableField(null)}>
            Cancel
          </Button>
        </HStack>
      ) : (
        <IconButton
          aria-label={`edit ${field}`}
          variant="ghost"
          size="sm"
          icon={<Edit size={18} />}
          onClick={() => setEditableField(field)}
        />
      )}
    </Flex>
  );

  return (
    <Box 
      h="100%" 
      w="100%" 
      bg="gray.50" 
      py={{ base: 4, md: 6 }}
      px={{ base: 2, md: 4 }}
      overflow="auto"
    >
      {userData.isVeteran ? (
        // Full profile view for veterans
        <Container maxW="1200px" h="100%">
          <Stack 
            spacing={5} 
            direction={{ base: "column", md: "row" }}
            h="100%"
            align="flex-start"
          >
            <Box 
              shadow="md" 
              p={6} 
              bgColor="white" 
              maxW={{ base: "100%", md: "320px" }} 
              w="full" 
              borderRadius="0"
              position="sticky"
              top="0"
              transition="all 0.2s"
              _hover={{ shadow: "lg" }}
            >
              <Center flexDirection="column">
                <Box position="relative" mb={6}>
                  <Avatar 
                    size="2xl"
                    src={userData.profilePic != null && userData.profilePic != '' ? userData.profilePic : ''} 
                    name={`${userData.firstName} ${userData.lastName}`}
                    border="3px solid"
                    borderColor="gray.100"
                  />
                  <IconButton
                    aria-label='add profile picture'
                    icon={<PlusCircle />}
                    onClick={handleAddImage}
                    variant="ghost"
                    position="absolute"
                    bottom="0"
                    right="0"
                    colorScheme="gray"
                    size="sm"
                    borderRadius="full"
                  />
                </Box>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  multiple
                />
                
                <Heading size="md" mb={1}>
                  {userData.firstName} {userData.lastName}
                </Heading>
                <Text color="gray.500" fontSize="md" mb={2}>{`@${userData.username}`}</Text>
                <Text color="gray.600" fontSize="sm" mb={1}>{userData.email}</Text>
                <Text color="gray.600" fontSize="sm" mb={4}>
                  {userData.phoneNumber || 'No phone number provided'}
                </Text>
                
                <HStack mb={3} spacing={2}>
                  <Badge colorScheme="gray" px={3} py={1} borderRadius="full">
                    Veteran
                  </Badge>
                </HStack>
              </Center>
            </Box>
            
            <Box 
              shadow="md" 
              p={6} 
              bgColor="white" 
              flex="1"
              borderRadius="0"
              maxH={{ md: "calc(100vh - 48px)" }}
              overflowY={{ md: "auto" }}
              transition="all 0.2s"
              _hover={{ shadow: "lg" }}
            >
              <Heading size="md" mb={6} color="gray.700">
                Veteran Profile Information
              </Heading>
              <VStack divider={<Divider />} spacing={4} align="stretch">
                {renderField("employmentStatus", "Employment Status", userData.employmentStatus, <Briefcase size={20} />)}
                <HStack spacing={4} flexDir={{ base: "column", sm: "row" }} w="100%">
                  <Box w={{ base: "100%", sm: "50%" }}>
                    {renderField("height", "Height (cm)", userData.height, <Activity size={20} />)}
                  </Box>
                  <Box w={{ base: "100%", sm: "50%" }}>
                    {renderField("weight", "Weight (kg)", userData.weight, <Activity size={20} />)}
                  </Box>
                </HStack>
                {renderField("liveLocation", "Live Location", userData.liveLocation, <MapPin size={20} />)}
                {renderField("workLocation", "Work Location", userData.workLocation, <MapPin size={20} />)}
                {renderField("interests", "Interests", userData.interests, <Heart size={20} />)}
              </VStack>
            </Box>
          </Stack>
        </Container>
      ) : (
        // Simplified, centered card for non-veterans/regular users
        <Center h="calc(100vh - 48px)">
          <Box
            shadow="md"
            p={8}
            bg="white"
            maxW="500px"
            w="full"
            borderRadius="md"
            transition="all 0.2s"
            _hover={{ shadow: "lg" }}
          >
            <VStack spacing={6}>
              <Box position="relative">
                <Avatar 
                  size="2xl"
                  src={userData.profilePic != null && userData.profilePic != '' ? userData.profilePic : ''} 
                  name={`${userData.firstName} ${userData.lastName}`}
                  border="3px solid"
                  borderColor="gray.100"
                  mb={2}
                />
                <IconButton
                  aria-label='add profile picture'
                  icon={<PlusCircle />}
                  onClick={handleAddImage}
                  variant="ghost"
                  position="absolute"
                  bottom="0"
                  right="0"
                  colorScheme="gray"
                  size="sm"
                  borderRadius="full"
                />
                
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  multiple
                />
              </Box>
              
              <Heading size="md" textAlign="center" color="black">
                {userData.firstName} {userData.lastName}
              </Heading>
              
              <Text color="gray.500" fontSize="md" textAlign="center">
                @{userData.username}
              </Text>
              
              {!userData.isVeteran && (
                <Badge colorScheme="gray" px={3} py={1} borderRadius="full">
                  Admin
                </Badge>
              )}
              
              <Divider />
              
              {/* Only show properties that have values */}
              {userData.email && (
                <Text color="gray.600" fontSize="md">
                  <strong>Email:</strong> {userData.email}
                </Text>
              )}
              
              <Text color="gray.600" fontSize="md">
                <strong>Phone:</strong> {userData.phoneNumber || 'Not provided'}
              </Text>
              
              {userData.interests && userData.interests.length > 0 && (
                renderField("interests", "Interests", userData.interests, <Heart size={20} />)
              )}
              
              {/* Only show these fields if they have values */}
              {userData.employmentStatus && (
                <Text color="gray.600" fontSize="md">
                  <strong>Employment:</strong> {userData.employmentStatus}
                </Text>
              )}
              
              {userData.liveLocation && (
                <Text color="gray.600" fontSize="md">
                  <strong>Location:</strong> {userData.liveLocation}
                </Text>
              )}
            </VStack>
          </Box>
        </Center>
      )}
    </Box>
  );
};

export default Profile;