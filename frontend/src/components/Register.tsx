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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  interests: string[];
  employmentStatus: string;
  workLocation: string;
  liveLocation: string;
  isVeteran: boolean;
  weight?: number; // New field
  height?: number; // New field
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    interests: [],
    employmentStatus: '',
    workLocation: '',
    liveLocation: '',
    isVeteran: false,
    weight: undefined,
    height: undefined,
  });

  // Initialize errors state
  const [errors, setErrors] = useState<string | null>(null);

  const handleNext = () => {
    // Basic validation before moving to next step
    if (
      !formData.username ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.password
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
    const parsedValue = value === '' ? undefined : parseFloat(value);
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
        formData.weight === undefined ||
        formData.height === undefined
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
        liveLocation: formData.liveLocation || "",
      };

      const response = await axios.post('http://localhost:8000/users/register', payload);
      console.log(response.data);
      navigate('/login'); // Redirect to login after successful registration
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setErrors(err.response.data.detail);
      } else {
        setErrors('An unexpected error occurred.');
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
          Register
        </Heading>
        <form onSubmit={handleSubmit}>
          <Box maxW="md" mx="auto" mt={8} p={4}>
            {errors && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {errors}
              </Alert>
            )}
            {step === 1 && (
              <>
                <FormControl id="username" isRequired>
                  <FormLabel fontSize="lg">Username</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    size="lg"
                  />
                </FormControl>
                <FormControl id="firstName" isRequired mt={4}>
                  <FormLabel fontSize="lg">First Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter your first name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    size="lg"
                  />
                </FormControl>
                <FormControl id="lastName" isRequired mt={4}>
                  <FormLabel fontSize="lg">Last Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter your last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    size="lg"
                  />
                </FormControl>
                <FormControl id="password" isRequired mt={4}>
                  <FormLabel fontSize="lg">Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    size="lg"
                  />
                </FormControl>

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
                  <>
                    <FormControl id="interests" isRequired>
                      <FormLabel fontSize="lg">
                        What are your interests?
                      </FormLabel>
                      <RadioGroup
                        name="interests"
                        onChange={(value: string) =>
                          handleRadioChange('interests', value)
                        }
                      >
                        <Stack direction="column">
                          <Radio value="Fitness">Fitness</Radio>
                          <Radio value="Nutrition">Nutrition</Radio>
                          <Radio value="Community">Community</Radio>
                          <Radio value="Job Training">Job Training</Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    <FormControl id="employmentStatus" mt={4} isRequired>
                      <FormLabel fontSize="lg">Employment Status</FormLabel>
                      <RadioGroup
                        name="employmentStatus"
                        onChange={(value: string) =>
                          handleRadioChange('employmentStatus', value)
                        }
                        value={formData.employmentStatus}
                      >
                        <Stack direction="column">
                          <Radio value="Employed">Employed</Radio>
                          <Radio value="Unemployed">Unemployed</Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                    <FormControl id="liveLocation" mt={4} isRequired>
                      <FormLabel fontSize="lg">Where do you live?</FormLabel>
                      <Input
                        type="text"
                        placeholder="Enter where you live"
                        name="liveLocation"
                        value={formData.liveLocation}
                        onChange={handleInputChange}
                        size="lg"
                      />
                    </FormControl>

                    <FormControl id="workLocation" mt={4} isRequired>
                      <FormLabel fontSize="lg">Where do you work?</FormLabel>
                      <Input
                        type="text"
                        placeholder="Enter where you work"
                        name="workLocation"
                        value={formData.workLocation}
                        onChange={handleInputChange}
                        size="lg"
                      />
                    </FormControl>

                    <FormControl id="weight" isRequired mt={4}>
                      <FormLabel fontSize="lg">Weight (kg)</FormLabel>
                      <Input
                        type="number"
                        placeholder="Enter your weight"
                        name="weight"
                        value={formData.weight !== undefined ? formData.weight : ''}
                        onChange={handleNumberChange}
                        size="lg"
                        min="0"
                        step="0.1"
                      />
                    </FormControl>

                    <FormControl id="height" isRequired mt={4}>
                      <FormLabel fontSize="lg">Height (cm)</FormLabel>
                      <Input
                        type="number"
                        placeholder="Enter your height"
                        name="height"
                        value={formData.height !== undefined ? formData.height : ''}
                        onChange={handleNumberChange}
                        size="lg"
                        min="0"
                        step="0.1"
                      />
                    </FormControl>
                  </>
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
