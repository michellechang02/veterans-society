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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle login logic here
  };

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
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={6}>
            <FormControl id="email" isRequired>
              <FormLabel fontSize="lg">Email</FormLabel>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                size="lg"
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel fontSize="lg">Password</FormLabel>
              <Input 
                type="password" 
                placeholder="Enter your password" 
                size="lg"
              />
            </FormControl>

            <Button 
              bgColor="gray.500" 
              color="white"
              size="lg" 
              type="submit" 
              width="full"
              fontSize="lg"
              fontWeight="bold"
            >
              Login
            </Button>
          </Stack>
        </form>
        <Text mt={6} textAlign="center" fontSize="lg">
          Don't have an account? <Button variant="link" colorScheme="gray" onClick={() => navigate('/register')}>Sign Up</Button>
        </Text>
      </Box>
    </Center>
  );
};

export default Login;
