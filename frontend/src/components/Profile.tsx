import React, { useState, useEffect } from 'react';
import {
  Box, Text, VStack, HStack, Divider, Stack, IconButton,
  Flex, Spacer, Button, Input, Avatar, Center, useToast,
} from '@chakra-ui/react';
import { Edit } from 'react-feather';
import axios from 'axios';

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

  const [editableField, setEditableField] = useState<string | null>(null);
  const toast = useToast();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/users/michellechang02');
        setUserData(response.data);
        console.log(response.data)
      } catch (error: unknown) {
        toast({
          title: 'Error fetching user data',
          description: (error as Error).message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchUserData();
  }, [toast]);

  // Handle field updates
  const handleFieldUpdate = async (field: string, value: string) => {
    try {
      const updatedData = { [field]: field === 'interests' ? value.split(', ') : value };
      await axios.put(`http://127.0.0.1:8000/users/${userData.username}`, updatedData);
      setUserData((prev) => ({
        ...prev,
        [field]: field === 'interests' ? value.split(', ') : value,
      }));
      setEditableField(null);
      toast({
        title: 'Update successful',
        description: `${field} updated successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      toast({
        title: 'Error updating field',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
      {editableField === field ? (
        <>
          <Button
            colorScheme="blue"
            ml={3}
            onClick={() =>
              handleFieldUpdate(
                field,
                value !== null
                  ? typeof value === 'number'
                    ? value.toString() // Convert number to string
                    : Array.isArray(value)
                    ? value.join(', ') // Join array into a string
                    : value
                  : '' // Handle null by providing an empty string
              )
            }
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
      <Box shadow="md" p={10} width="70%" borderWidth="1px">
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
