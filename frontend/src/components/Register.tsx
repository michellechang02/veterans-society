// frontend/src/components/Register.tsx
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
  RadioGroup,
  Radio,
  Checkbox,
  Alert,
  AlertIcon,
  Grid,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  phoneNumber: string;
  email: string;
  interests: string[];
  employmentStatus: string;
  workLocation: string;
  liveLocation: string;
  isVeteran: boolean;
  weight: number;
  height: number;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    phoneNumber: '',
    email: '',
    interests: [],
    employmentStatus: '',
    workLocation: '',
    liveLocation: '',
    isVeteran: false,
    weight: 0,
    height: 0,
  });

  // Initialize errors state
  const [errors, setErrors] = useState<string | null>(null);

  const handleNext = () => {
    // Basic validation before moving to next step
    if (
      !formData.username ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.password ||
      !formData.phoneNumber
    ) {
      setErrors("Please fill out all required fields in Step 1.");
      return;
    }
    setErrors(null);
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRadioChange = (
    name: string,
    value: string
  ) => {
    // For interests, ensure it's stored as an array
    if (name === 'interests') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: [value],
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = value === '' ? 0 : parseFloat(value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    // Additional frontend validation
    if (formData.isVeteran) {
      if (
        !formData.employmentStatus ||
        !formData.workLocation ||
        !formData.liveLocation ||
        formData.weight === 0 ||
        formData.height === 0
      ) {
        setErrors("Please fill out all required fields for veterans.");
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        interests: formData.interests, // Already an array
        workLocation: formData.workLocation || "",
        employmentStatus: formData.employmentStatus || "",
        liveLocation: formData.liveLocation || "",
        weight: formData.weight,
        height: formData.height,
        isVeteran: formData.isVeteran || false,
        email: formData.email !== '' ? formData.email : null
      };

      const response = await axios.post('http://localhost:8000/users/register', payload);
      console.log(response.data);
      navigate('/login'); // Redirect to login after successful registration
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        const errorMessages = err.response.data.detail.map((error: any) => error.msg).join(', ');
        setErrors(errorMessages);
      } else {
        setErrors('An unexpected error occurred.');
      }
    }
  };

  return (
    <Center>
  <Box
    p={10}
    mt={10}
    h="80vh"
    width={{ base: "100vw", md: "80vw", lg: "60vw" }}
    minWidth="300px"
    maxWidth="100vw"
    borderWidth={2}
    borderRadius={12}
    boxShadow="2xl"
  >
    <Heading mb={8} textAlign="center" fontSize="3xl">
      Register
    </Heading>
    <form onSubmit={handleSubmit}>
      <Box mx="auto" mt={8}>
        {errors && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {errors}
          </Alert>
        )}
        {step === 1 && (
          <>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
  <FormControl id="username" isRequired>
    <FormLabel fontSize="lg">Username</FormLabel>
    <Input
      type="text"
      placeholder="Username"
      name="username"
      value={formData.username}
      onChange={handleInputChange}
      size="lg"
    />
  </FormControl>

  <FormControl id="firstName" isRequired>
    <FormLabel fontSize="lg">First Name</FormLabel>
    <Input
      type="text"
      placeholder="First name"
      name="firstName"
      value={formData.firstName}
      onChange={handleInputChange}
      size="lg"
    />
  </FormControl>

  <FormControl id="lastName" isRequired>
    <FormLabel fontSize="lg">Last Name</FormLabel>
    <Input
      type="text"
      placeholder="Last name"
      name="lastName"
      value={formData.lastName}
      onChange={handleInputChange}
      size="lg"
    />
  </FormControl>

  <FormControl id="password" isRequired>
    <FormLabel fontSize="lg">Password</FormLabel>
    <Input
      type="password"
      placeholder="Password"
      name="password"
      value={formData.password}
      onChange={handleInputChange}
      size="lg"
    />
  </FormControl>

  <FormControl id="phoneNumber" isRequired>
    <FormLabel fontSize="lg">Phone Number</FormLabel>
    <Input
      type="text"
      placeholder="Enter your phone number"
      name="phoneNumber"
      value={formData.phoneNumber}
      onChange={handleInputChange}
      size="lg"
    />
  </FormControl>

  <FormControl id="email">
    <FormLabel fontSize="lg">Email</FormLabel>
    <Input
      type="email"
      placeholder="Enter your email"
      name="email"
      value={formData.email}
      onChange={handleInputChange}
      size="lg"
    />
  </FormControl>
</Grid>


            <Checkbox
              name="isVeteran"
              isChecked={formData.isVeteran}
              onChange={handleInputChange}
              mt={4}
            >
              I am a veteran
            </Checkbox>

            <Button
              bgColor="gray.500"
              color="white"
              size="lg"
              mt={6}
              width="full"
              onClick={handleNext}
            >
              Next
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            {formData.isVeteran && (
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <FormControl id="interests" isRequired>
                  <FormLabel fontSize="lg" mb={2}>What are your interests?</FormLabel>
                  <RadioGroup
                    name="interests"
                    onChange={(value) => handleRadioChange('interests', value)}
                  >
                    <Stack direction="column" spacing={2}>
                      <Radio value="Fitness">Fitness</Radio>
                      <Radio value="Nutrition">Nutrition</Radio>
                      <Radio value="Community">Community</Radio>
                      <Radio value="Job Training">Job Training</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <FormControl id="employmentStatus" isRequired>
                  <FormLabel fontSize="lg" mb={2}>Employment Status</FormLabel>
                  <RadioGroup
                    name="employmentStatus"
                    onChange={(value) => handleRadioChange('employmentStatus', value)}
                    value={formData.employmentStatus}
                  >
                    <Stack direction="column" spacing={2}>
                      <Radio value="Employed">Employed</Radio>
                      <Radio value="Unemployed">Unemployed</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <FormControl id="liveLocation" isRequired>
                  <FormLabel fontSize="lg" mb={2}>Where do you live?</FormLabel>
                  <Input
                    type="text"
                    placeholder="Living Location"
                    name="liveLocation"
                    value={formData.liveLocation}
                    onChange={handleInputChange}
                    size="lg"
                    p={2}
                  />
                </FormControl>

                <FormControl id="workLocation" isRequired>
                  <FormLabel fontSize="lg" mb={2}>Where do you work?</FormLabel>
                  <Input
                    type="text"
                    placeholder="Work"
                    name="workLocation"
                    value={formData.workLocation}
                    onChange={handleInputChange}
                    size="lg"
                    p={2}
                  />
                </FormControl>

                <FormControl id="weight" isRequired>
                  <FormLabel fontSize="lg" mb={2}>Weight (kg)</FormLabel>
                  <Input
                    type="number"
                    placeholder="Weight"
                    name="weight"
                    value={formData.weight !== undefined ? formData.weight : ''}
                    onChange={handleNumberChange}
                    size="lg"
                    p={2}
                    min="0"
                    step="0.1"
                  />
                </FormControl>

                <FormControl id="height" isRequired>
                  <FormLabel fontSize="lg" mb={2}>Height (cm)</FormLabel>
                  <Input
                    type="number"
                    placeholder="Height"
                    name="height"
                    value={formData.height !== undefined ? formData.height : ''}
                    onChange={handleNumberChange}
                    size="lg"
                    p={2}
                    min="0"
                    step="0.1"
                  />
                </FormControl>
              </Grid>
            )}

            <Stack direction="row" mt={6} spacing={4}>
              <Button size="lg" onClick={handleBack}>
                Back
              </Button>
              <Button
                bgColor="gray.500"
                color="white"
                size="lg"
                type="submit"
                width="full"
              >
                Register
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </form>

    <Text mt={6} textAlign="center" fontSize="lg">
      Already have an account?{' '}
      <Button
        variant="link"
        colorScheme="gray"
        onClick={() => navigate('/login')}
      >
        Login
      </Button>
    </Text>
  </Box>
</Center>



  );
};

export default Register;
