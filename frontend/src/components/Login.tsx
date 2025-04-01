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
  useColorModeValue,
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

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const formLabelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const inputHoverBorderColor = useColorModeValue('gray.400', 'gray.500');
  const inputFocusBorderColor = useColorModeValue('gray.500', 'gray.400');
  const buttonBgColor = useColorModeValue('gray.500', 'gray.600');
  const buttonHoverBgColor = useColorModeValue('gray.600', 'gray.700');
  const buttonActiveBgColor = useColorModeValue('gray.700', 'gray.800');
  const pageBgColor = useColorModeValue('gray.50', 'gray.900');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const linkColor = useColorModeValue('gray.500', 'gray.400');
  const linkHoverColor = useColorModeValue('gray.700', 'gray.200');

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
        localStorage.setItem('role', isAdminUser ? 'admin' : 'veteran');
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
    <Center h="100vh" bg={pageBgColor}>
      <Box
        p={8}
        width="30vw"
        minWidth="350px"
        shadow="lg"
        borderRadius="md"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading mb={6} textAlign="center" fontSize="3xl" color={textColor}>
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="username" isRequired>
              <FormLabel fontSize="md" fontWeight="medium" color={formLabelColor}>Username</FormLabel>
              <Input
                name="username"
                type="text"
                placeholder="Enter your username"
                size="lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                borderColor={inputBorderColor}
                _hover={{ borderColor: inputHoverBorderColor }}
                _focus={{ borderColor: inputFocusBorderColor, boxShadow: `0 0 0 1px ${inputFocusBorderColor}` }}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel fontSize="md" fontWeight="medium" color={formLabelColor}>Password</FormLabel>
              <Input
                name="password"
                type="password"
                placeholder="Enter your password"
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderColor={inputBorderColor}
                _hover={{ borderColor: inputHoverBorderColor }}
                _focus={{ borderColor: inputFocusBorderColor, boxShadow: `0 0 0 1px ${inputFocusBorderColor}` }}
              />
            </FormControl>

            <Button
              mt={4}
              bgColor={buttonBgColor}
              color="white"
              size="lg"
              type="submit"
              width="full"
              fontSize="md"
              fontWeight="bold"
              isLoading={isLoading}
              _hover={{ bgColor: buttonHoverBgColor }}
              _active={{ bgColor: buttonActiveBgColor }}
              borderRadius="md"
              boxShadow="sm"
            >
              Sign In
            </Button>
          </Stack>
        </form>

        <Box mt={8} pt={6} borderTopWidth="1px" borderColor={borderColor}>
          <Text textAlign="center" fontSize="md" color={secondaryTextColor}>
            Don't have an account?{" "}
            <Button
              variant="link"
              color={linkColor}
              fontWeight="semibold"
              _hover={{ color: linkHoverColor }}
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
