import React, { useState } from 'react';
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
import { useAuth } from '../Auth/Auth';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUsername: setAuthUsername, setAuthToken, setIsAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/users/login', {
        username,
        password
      });

      if (response.data.access_token) {
        const isAdminUser = response.data.role === 'admin';

        // Store auth data
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('username', username);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('loginTime', Date.now().toString());

        // Update auth context
        setAuthUsername(username);
        setAuthToken(response.data.access_token);
        setIsAdmin(isAdminUser);

        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Redirect based on role
        if (isAdminUser) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.detail || 'Please check your credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center h="100vh">
      <Box
        p={10}
        width="30vw"
        minWidth="350px"
        shadow="md"
      >
        <Heading mb={8} textAlign="center" fontSize="3xl">
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={6}>
            <FormControl id="username" isRequired>
              <FormLabel fontSize="lg">Username</FormLabel>
              <Input
                name="username"
                type="text"
                placeholder="Enter your username"
                size="lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel fontSize="lg">Password</FormLabel>
              <Input
                name="password"
                type="password"
                placeholder="Enter your password"
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              isLoading={isLoading}
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
