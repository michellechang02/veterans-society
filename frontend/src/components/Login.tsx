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
import axios from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const response = await axios.post('http://127.0.0.1:8000/users/login', { username, password }, {
        headers: { "Content-Type": "application/json" }
      });
      console.log(response.data.message); // Expected output: "Login successful!"
      alert("Login successful!");
      navigate(`/${username}/feed`)

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          alert(`Login failed: ${error.response.data.detail}`);
        } else {
          alert("An unexpected error occurred during login.");
        }
      } else {
        console.error("Non-Axios error:", error);
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
