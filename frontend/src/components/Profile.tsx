import React, { useState } from 'react';
import {
  Box, Text, VStack, HStack, Divider, Stack, IconButton,
  Flex, Spacer, Button, Input, Avatar, Center
} from '@chakra-ui/react';
import { Edit } from 'react-feather';

const Profile: React.FC = () => {
  
  
  const [homeStatus, setHomeStatus] = useState<string>('Homeowner');
  const [employmentStatus, setEmploymentStatus] = useState<string>('Employed');
  const [mentalHealth, setMentalHealth] = useState<string>('Good');
  const [jobStatus, setJobStatus] = useState<string>('Full-time');
  const [interests, setInterests] = useState<string[]>('Coding, Reading'.split(', '));


  // for now
  const username = 'michellechang';
  const firstName = 'Michelle';
  const lastName = 'Chang';
  const email = 'changmi@seas.upenn.edu'
  const photoURL = 'https://bit.ly/dan-abramov';



  const [showField, setShowField] = useState({
    homeStatus: true,
    employmentStatus: true,
    mentalHealth: true,
    jobStatus: true,
    interests: true,
  });

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'homeStatus': setHomeStatus(value); break;
      case 'employmentStatus': setEmploymentStatus(value); break;
      case 'mentalHealth': setMentalHealth(value); break;
      case 'jobStatus': setJobStatus(value); break;
      case 'interests': setInterests(value.split(', ')); break;
      default: break;
    }
  };

  return (
    <Stack spacing={8} direction="row" margin="50px">
      <Box p={10} shadow="md" width="30%" borderWidth="1px">
        <Center>
          <Avatar alignSelf="center" src={photoURL} sx={{ width: 60, height: 60 }} />
        </Center>
        <HStack>
          <Text align="left" fontWeight="bold" ml={7} fontSize="2xl" p="30px 0px 0px">{firstName} {lastName}</Text>
        </HStack>
        <Text align="left" ml={7} fontSize="lg">{`@${username}`}</Text>
        <Text align="left" ml={7} color="grey" fontSize="sm">{email}</Text>
      </Box>
      <Box shadow="md" p={10} width="70%" borderWidth="1px">
        <VStack divider={<Divider />} spacing="7" align="left">

          {/* Home Status */}
          <Flex direction="row" align="center">
            <Text fontWeight="bold" fontSize="xl">Home Status:</Text>
            {showField.homeStatus ? (
              <Text ml={3} fontSize="xl">{homeStatus}</Text>
            ) : (
              <Input
                ml={3}
                value={homeStatus}
                onChange={(e) => handleFieldChange('homeStatus', e.target.value)}
              />
            )}
            <Spacer />
            {showField.homeStatus ? (
              <IconButton
                aria-label="edit home status"
                variant="ghost"
                icon={<Edit />}
                onClick={() => setShowField(prev => ({ ...prev, homeStatus: !prev.homeStatus }))}
              />
            ) : (
              <>
                <Button
                  colorScheme="blue"
                  ml={3}
                  onClick={() => setShowField(prev => ({ ...prev, homeStatus: true }))}
                  mr={3}
                >
                  Save
                </Button>
                <Button
                  onClick={() => setShowField(prev => ({ ...prev, homeStatus: true }))}
                >
                  Cancel
                </Button>
              </>
            )}
          </Flex>

          {/* Employment Status */}
          <Flex direction="row" align="center">
            <Text fontWeight="bold" fontSize="xl">Employment Status:</Text>
            {showField.employmentStatus ? (
              <Text ml={3} fontSize="xl">{employmentStatus}</Text>
            ) : (
              <Input
                ml={3}
                value={employmentStatus}
                onChange={(e) => handleFieldChange('employmentStatus', e.target.value)}
              />
            )}
            <Spacer />
            {showField.employmentStatus ? (
              <IconButton
                aria-label="edit employment status"
                variant="ghost"
                icon={<Edit />}
                onClick={() => setShowField(prev => ({ ...prev, employmentStatus: !prev.employmentStatus }))}
              />
            ) : (
              <>
                <Button
                  colorScheme="blue"
                  ml={3}
                  onClick={() => setShowField(prev => ({ ...prev, employmentStatus: true }))}
                  mr={3}
                >
                  Save
                </Button>
                <Button
                  onClick={() => setShowField(prev => ({ ...prev, employmentStatus: true }))}
                >
                  Cancel
                </Button>
              </>
            )}
          </Flex>

          {/* Mental Health */}
          <Flex direction="row" align="center">
            <Text fontWeight="bold" fontSize="xl">Mental Health:</Text>
            {showField.mentalHealth ? (
              <Text ml={3} fontSize="xl">{mentalHealth}</Text>
            ) : (
              <Input
                ml={3}
                value={mentalHealth}
                onChange={(e) => handleFieldChange('mentalHealth', e.target.value)}
              />
            )}
            <Spacer />
            {showField.mentalHealth ? (
              <IconButton
                aria-label="edit mental health"
                variant="ghost"
                icon={<Edit />}
                onClick={() => setShowField(prev => ({ ...prev, mentalHealth: !prev.mentalHealth }))}
              />
            ) : (
              <>
                <Button
                  colorScheme="blue"
                  ml={3}
                  onClick={() => setShowField(prev => ({ ...prev, mentalHealth: true }))}
                  mr={3}
                >
                  Save
                </Button>
                <Button
                  onClick={() => setShowField(prev => ({ ...prev, mentalHealth: true }))}
                >
                  Cancel
                </Button>
              </>
            )}
          </Flex>

          {/* Job Status */}
          <Flex direction="row" align="center">
            <Text fontWeight="bold" fontSize="xl">Job Status:</Text>
            {showField.jobStatus ? (
              <Text ml={3} fontSize="xl">{jobStatus}</Text>
            ) : (
              <Input
                ml={3}
                value={jobStatus}
                onChange={(e) => handleFieldChange('jobStatus', e.target.value)}
              />
            )}
            <Spacer />
            {showField.jobStatus ? (
              <IconButton
                aria-label="edit job status"
                variant="ghost"
                icon={<Edit />}
                onClick={() => setShowField(prev => ({ ...prev, jobStatus: !prev.jobStatus }))}
              />
            ) : (
              <>
                <Button
                  colorScheme="blue"
                  ml={3}
                  onClick={() => setShowField(prev => ({ ...prev, jobStatus: true }))}
                  mr={3}
                >
                  Save
                </Button>
                <Button
                  onClick={() => setShowField(prev => ({ ...prev, jobStatus: true }))}
                >
                  Cancel
                </Button>
              </>
            )}
          </Flex>

          {/* Interests */}
          <Flex direction="row" align="center">
            <Text fontWeight="bold" fontSize="xl">Interests:</Text>
            {showField.interests ? (
              <Text ml={3} fontSize="xl">{interests.join(', ')}</Text>
            ) : (
              <Input
                ml={3}
                value={interests.join(', ')}
                onChange={(e) => handleFieldChange('interests', e.target.value)}
              />
            )}
            <Spacer />
            {showField.interests ? (
              <IconButton
                aria-label="edit interests"
                variant="ghost"
                icon={<Edit />}
                onClick={() => setShowField(prev => ({ ...prev, interests: !prev.interests }))}
              />
            ) : (
              <>
                <Button
                  colorScheme="blue"
                  ml={3}
                  onClick={() => setShowField(prev => ({ ...prev, interests: true }))}
                  mr={3}
                >
                  Save
                </Button>
                <Button
                  onClick={() => setShowField(prev => ({ ...prev, interests: true }))}
                >
                  Cancel
                </Button>
              </>
            )}
          </Flex>

        </VStack>
      </Box>
    </Stack>
  );
};

export default Profile;
