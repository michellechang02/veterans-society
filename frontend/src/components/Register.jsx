import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Stack,
  Center,
  Text,
  InputGroup,
  InputLeftAddon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Register(props) {

    const navigate = useNavigate();

  return (
    <Center h="100vh">
      <Box 
        p={10} 
        width="30vw" 
        minWidth="350px"
        borderWidth={2} 
        borderRadius={12} 
        boxShadow="2xl"
      >
        <Heading mb={8} textAlign="center" fontSize="3xl">
          Register
        </Heading>
        <form>
          <Stack spacing={6}>
            <FormControl id="username" isRequired>
              <FormLabel fontSize="lg">Username</FormLabel>
              <Input 
                type="text" 
                placeholder="Username" 
                size="lg"
              />
            </FormControl>

            <FormControl id="phonenumber" isRequired>
              <FormLabel fontSize="lg">Phone Number</FormLabel>
              <InputGroup>
                <InputLeftAddon>+1</InputLeftAddon>
                <Input type='tel' placeholder='Phone number' />
              </InputGroup>
            </FormControl>

            <FormControl id="email">
              <FormLabel fontSize="lg">Email</FormLabel>
              <Input 
                type="email" 
                placeholder="Email" 
                size="lg"
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel fontSize="lg">Password</FormLabel>
              <Input 
                type="password" 
                placeholder="Password" 
                size="lg"
              />
            </FormControl>

            <FormControl id="confirm-password" isRequired>
              <FormLabel fontSize="lg">Confirm Password</FormLabel>
              <Input 
                type="password" 
                placeholder="Password" 
                size="lg"
              />
            </FormControl>


            <Button 
              colorScheme="teal" 
              size="lg" 
              type="submit" 
              width="full"
              fontSize="lg"
              fontWeight="bold"
            >
              Register
            </Button>
          </Stack>
        </form>
        <Text mt={6} textAlign="center" fontSize="lg">
          Already have an account? <Button variant="link" colorScheme="teal" onClick={() => navigate('/login')}>Login</Button>
        </Text>
      </Box>
    </Center>
  );
}

export default Register;
