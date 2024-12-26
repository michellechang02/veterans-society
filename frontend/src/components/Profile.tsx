import React, { useState, useEffect } from 'react';
import {
  Box, Text, VStack, HStack, Divider, Stack, IconButton,
  Flex, Spacer, Button, Input, Avatar, Center, useToast,
} from '@chakra-ui/react';
import { Edit } from 'react-feather';
import { useAuth } from '../Auth/Auth';
import { getUserData } from '../Api/getData';
import { putUserData } from '../Api/putData';

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
    photoURL: 'https://bit.ly/dan-abramov', // Placeholder for avatar
  });

  const { username } = useAuth();

  const [editableField, setEditableField] = useState<string | null>(null);
  const toast = useToast();

  // Fetch user data on component mount
  useEffect(() => {
    if (username) { // Ensure username is not null
      getUserData({ username, setUserData, toast });
    }
  }, [username, toast]);

  

  const renderField = (field: string, label: string, value: string | number | string[] | null) => (
    <Flex direction="row" align="center">
      <Text fontWeight="bold" fontSize="xl">{label}:</Text>
      {editableField === field ? (
        <Input
          ml={3}
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
        />
      ) : (
        <Text ml={3} fontSize="xl">
          {Array.isArray(value) ? value.join(', ') : value !== null ? value.toString() : 'N/A'}
        </Text>
      )}
      <Spacer />
      {editableField === field && username ? (
        <>
        <Button
          bgColor="gray.500" color="white"
          ml={3}
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
        <Button ml={3} onClick={() => setEditableField(null)}>
          Cancel
        </Button>
      </>
      ) : (
        <IconButton
          aria-label={`edit ${field}`}
          variant="ghost"
          icon={<Edit />}
          onClick={() => setEditableField(field)}
        />
      )}
    </Flex>
  );
  
  

  return (
    <Stack spacing={8} direction="row" margin="50px">
      <Box p={10} shadow="md" width="30%" borderWidth="1px">
        <Center>
          <Avatar alignSelf="center" src='https://bit.ly/dan-abramov' sx={{ width: 60, height: 60 }} />
        </Center>
        <HStack>
          <Text align="left" fontWeight="bold" ml={7} fontSize="2xl" p="30px 0px 0px">
            {userData.firstName} {userData.lastName}
          </Text>
        </HStack>
        <Text align="left" ml={7} fontSize="lg">{`@${userData.username}`}</Text>
        <Text align="left" ml={7} color="grey" fontSize="sm">{userData.email}</Text>
      </Box>
      <Box shadow="md" p={10} width="70%" borderWidth="1px" >
        <VStack divider={<Divider />} spacing="7" align="left">
        {renderField("employmentStatus", "Employment Status", userData.employmentStatus)}
        {renderField("height", "Height (cm)", userData.height)}
        {renderField("weight", "Weight (kg)", userData.weight)}
        {renderField("liveLocation", "Live Location", userData.liveLocation)}
        {renderField("workLocation", "Work Location", userData.workLocation)}
        {renderField("interests", "Interests", userData.interests)}
        </VStack>
      </Box>
    </Stack>
  );
};

export default Profile;
