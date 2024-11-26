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
import { useAuth } from '../Auth/Auth';
import { useToast } from '@chakra-ui/react';
import { postLogin } from "../Api/postData";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUsername } = useAuth();
  const toast = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
  
    try {
      const { access_token } = await postLogin(username, password);
      sessionStorage.setItem("authToken", access_token);
      console.log('authToken:', access_token);
  
      toast({
        title: "Login successful",
        description: "You have successfully logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setUsername(username);
      navigate(`/${username}/feed`);
    } catch (error) {
      // Narrow the error type
      if (error instanceof Error) {
        toast({
          title: "Login failed",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Login failed",
          description: "An unknown error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
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
            <FormControl id="username" isRequired>
              <FormLabel fontSize="lg">Username</FormLabel>
              <Input
                name="username"
                type="text"
                placeholder="Enter your username"
                size="lg"
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel fontSize="lg">Password</FormLabel>
              <Input
                name="password"
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
