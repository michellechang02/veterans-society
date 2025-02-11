import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Text, VStack, HStack, Divider, Stack, IconButton,
  Flex, Spacer, Button, Input, Avatar, Center, useToast,
} from '@chakra-ui/react';
import { Edit } from 'react-feather';
import { useAuth } from '../Auth/Auth';
import { getUserData } from '../Api/getData';
import { putUserData } from '../Api/putData';

const Profile: React.FC = () => {
  const { username: loggedInUsername } = useAuth();
  const { username: profileUsername } = useParams();

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
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

  const [editableField, setEditableField] = useState<string | null>(null);
  const toast = useToast();
  
  const isOwnProfile = loggedInUsername === profileUsername;

  useEffect(() => {
    if (profileUsername) {
      getUserData({ username: profileUsername, setUserData, toast });
    }
  }, [profileUsername, toast]);

  const renderField = (field: string, label: string, value: string | number | string[] | null) => (
    <Flex direction="row" align="center">
      <Text fontWeight="bold" fontSize="xl">{label}:</Text>
      {editableField === field && isOwnProfile ? (
        <Input
          ml={3}
          type={typeof value === 'number' ? 'number' : 'text'}
          value={
            Array.isArray(value)
              ? value.join(', ')
              : value !== null
              ? value.toString()
              : ''
          }
          onChange={(e) =>
            setUserData((prev) => ({
              ...prev,
              [field]:
                typeof value === 'number'
                  ? parseFloat(e.target.value)
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
      {editableField === field && isOwnProfile ? (
        <>
          <Button
            bgColor="gray.500" color="white"
            ml={3}
            onClick={() => {
              const formattedValue =
                value !== null
                  ? typeof value === 'number'
                    ? value.toString()
                    : Array.isArray(value)
                    ? value.join(', ')
                    : value
                  : '';
              
              putUserData({
                username: loggedInUsername,
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
        isOwnProfile && (
          <IconButton
            aria-label={`edit ${field}`}
            variant="ghost"
            icon={<Edit />}
            onClick={() => setEditableField(field)}
          />
        )
      )}
    </Flex>
  );

  return (
    <Stack spacing={8} direction="row" margin="50px">
      <Box p={10} shadow="md" width="30%" borderWidth="1px">
        <Center>
          <Avatar alignSelf="center" src={userData.photoURL} sx={{ width: 60, height: 60 }} />
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
