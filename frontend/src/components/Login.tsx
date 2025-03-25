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
          navigate(`/${username}/dashboard`);
        } else {
          navigate(`/${username}/feed`);
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
    <Center h="100vh" bg="gray.50">
      <Box
        p={8}
        width="30vw"
        minWidth="350px"
        shadow="lg"
        borderRadius="md"
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <Heading mb={6} textAlign="center" fontSize="3xl" color="gray.800">
          Welcome Back
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="username" isRequired>
              <FormLabel fontSize="md" fontWeight="medium" color="gray.700">Username</FormLabel>
              <Input
                name="username"
                type="text"
                placeholder="Enter your username"
                size="lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "gray.500", boxShadow: "0 0 0 1px gray.500" }}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel fontSize="md" fontWeight="medium" color="gray.700">Password</FormLabel>
              <Input
                name="password"
                type="password"
                placeholder="Enter your password"
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "gray.500", boxShadow: "0 0 0 1px gray.500" }}
              />
            </FormControl>

            <Button
              mt={4}
              bgColor="gray.500"
              color="white"
              size="lg"
              type="submit"
              width="full"
              fontSize="md"
              fontWeight="bold"
              isLoading={isLoading}
              _hover={{ bgColor: "gray.600" }}
              _active={{ bgColor: "gray.700" }}
              borderRadius="md"
              boxShadow="sm"
            >
              Sign In
            </Button>
          </Stack>
        </form>
        
        <Box mt={8} pt={6} borderTopWidth="1px" borderColor="gray.200">
          <Text textAlign="center" fontSize="md" color="gray.600">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              color="gray.500" 
              fontWeight="semibold"
              _hover={{ color: "gray.700" }}
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </Text>
        </Box>
      </Box>
    </Center>
  );
};

export default Login;
