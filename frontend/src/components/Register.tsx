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
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { postUser } from '../Api/postData';
import { useAuth } from '../Auth/Auth';

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
  const toast = useToast();
  const { setUsername: setAuthUsername, setAuthToken, setIsAdmin, setAuth } = useAuth();

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
    if (step === 1) {
      // Validate required fields for first step
      const requiredFields = ['username', 'firstName', 'lastName', 'password', 'phoneNumber'];
      const isValid = requiredFields.every(
        (field) => formData[field as keyof typeof formData] && formData[field as keyof typeof formData] !== ""
      );
      
      if (!isValid) {
        toast({
          title: 'Please fill out all required fields',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    } else if (step === 2 && formData.isVeteran) {
      // Validate required fields for veterans on step 2
      const requiredFields = ['liveLocation', 'employmentStatus', 'weight', 'height'];

      if (formData.employmentStatus === 'Employed') {
        requiredFields.push('workLocation');
      }

      const isValid = requiredFields.every(
        (field) => {
          const value = formData[field as keyof typeof formData];
          return value !== undefined && value !== null && value !== "";
        }
      );
      
      if (!isValid) {
        toast({
          title: 'Please fill out all required fields',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

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

  const handleRadioChange = (name: string, value: string) => {
    if (name === 'interests') {
      setFormData((prevData) => ({
        ...prevData,
        interests: prevData.interests.includes(value)
          ? prevData.interests.filter(interest => interest !== value)
          : [...prevData.interests, value]
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        ...(name === 'employmentStatus' && value === 'Unemployed' ? { workLocation: 'N/A' } : {})
      }));
    }
  };

  const handleCheckboxChange = (interest: string) => {
    setFormData((prevData) => {
      const updatedInterests = prevData.interests.includes(interest)
        ? prevData.interests.filter((i) => i !== interest) // Remove if already selected
        : [...prevData.interests, interest]; // Add if not selected

      return { ...prevData, interests: updatedInterests };
    });
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = value ? parseFloat(value) : '';
    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    postUser({ 
      formData, 
      setErrors, 
      navigate, 
      toast, 
      setAuth: {
        setAuthUsername,
        setAuthToken,
        setIsAdmin,
        setAuth
      }
    });
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <Box
        mt={2}
        p={10}
        minH="60vh"
        width={{ base: "100vw", md: "80vw", lg: "60vw" }}
        minWidth="300px"
        maxWidth="100vw"
        shadow="lg"
        borderRadius="md"
        bg="white"
        borderColor="gray.200"
        borderWidth="1px"
      >
        <Heading mb={4} textAlign="center" fontSize="3xl" color="gray.800">
          Register
        </Heading>
        <Box as="hr" my={4} borderColor="gray.200" />
        <form onSubmit={handleSubmit}>
          <Box mx="auto" mt={6}>
            {errors && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                {errors}
              </Alert>
            )}
            {step === 1 && (
              <>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
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

                <Box p={4} bg="gray.50" borderRadius="md" mt={6}>
                  <Checkbox
                    name="isVeteran"
                    isChecked={formData.isVeteran}
                    onChange={handleInputChange}
                    colorScheme="gray"
                  >
                    I am a veteran
                  </Checkbox>
                </Box>

                <Button
                  bgColor="gray.500"
                  color="white"
                  size="lg"
                  mt={6}
                  width="full"
                  onClick={handleNext}
                  _hover={{ bgColor: "gray.600" }}
                  borderRadius="md"
                >
                  Next
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  {formData.isVeteran && (
                    <>
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

                      <FormControl id="interests">
                        <FormLabel fontSize="lg" mb={2}>Interests</FormLabel>
                        <Stack 
                          direction={{ base: "column", md: "row" }}
                          spacing={3} 
                          p={2} 
                          bg="gray.50" 
                          borderRadius="md"
                          flexWrap="wrap"
                        >
                          <Checkbox
                            isChecked={formData.interests.includes('Fitness')}
                            onChange={() => handleCheckboxChange('Fitness')}
                            colorScheme="gray"
                          >
                            Fitness
                          </Checkbox>
                          <Checkbox
                            isChecked={formData.interests.includes('Nutrition')}
                            onChange={() => handleCheckboxChange('Nutrition')}
                            colorScheme="gray"
                          >
                            Nutrition
                          </Checkbox>
                          <Checkbox
                            isChecked={formData.interests.includes('Community')}
                            onChange={() => handleCheckboxChange('Community')}
                            colorScheme="gray"
                          >
                            Community
                          </Checkbox>
                          <Checkbox
                            isChecked={formData.interests.includes('Job Training')}
                            onChange={() => handleCheckboxChange('Job Training')}
                            colorScheme="gray"
                          >
                            Job Training
                          </Checkbox>
                        </Stack>
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

                      <FormControl id="workLocation" isRequired={formData.employmentStatus === 'Employed'}>
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
                        />
                      </FormControl>
                      
                      {/* Privacy notice */}
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        fontStyle="italic"
                        mb={4}
                        px={2}
                        gridColumn="span 2"
                      >
                        Your height and weight will only be shared with verified employers of organizations and health professionals. We do not disclose this information to other users or third parties.
                      </Text>
                    </>
                  )}
                  
                  {!formData.isVeteran && (
                    <FormControl id="interests" gridColumn="span 2">
                      <FormLabel fontSize="lg" mb={2}>Interests</FormLabel>
                      <Stack 
                        direction={{ base: "column", md: "row" }}
                        spacing={3} 
                        p={3} 
                        bg="gray.50" 
                        borderRadius="md"
                        flexWrap="wrap"
                      >
                        <Checkbox
                          isChecked={formData.interests.includes('Fitness')}
                          onChange={() => handleCheckboxChange('Fitness')}
                          colorScheme="gray"
                        >
                          Fitness
                        </Checkbox>
                        <Checkbox
                          isChecked={formData.interests.includes('Nutrition')}
                          onChange={() => handleCheckboxChange('Nutrition')}
                          colorScheme="gray"
                        >
                          Nutrition
                        </Checkbox>
                        <Checkbox
                          isChecked={formData.interests.includes('Community')}
                          onChange={() => handleCheckboxChange('Community')}
                          colorScheme="gray"
                        >
                          Community
                        </Checkbox>
                        <Checkbox
                          isChecked={formData.interests.includes('Job Training')}
                          onChange={() => handleCheckboxChange('Job Training')}
                          colorScheme="gray"
                        >
                          Job Training
                        </Checkbox>
                      </Stack>
                    </FormControl>
                  )}
                </Grid>

                <Stack direction="row" mt={6} spacing={4}>
                  <Button 
                    size="lg" 
                    onClick={handleBack}
                    borderColor="gray.500"
                    borderWidth="1px"
                    color="gray.500"
                    variant="outline"
                    _hover={{ bg: "gray.50" }}
                    borderRadius="md"
                  >
                    Back
                  </Button>
                  <Button
                    bgColor="gray.500"
                    color="white"
                    size="lg"
                    type="submit"
                    width="full"
                    _hover={{ bgColor: "gray.600" }}
                    borderRadius="md"
                  >
                    Register
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        </form>

        <Box as="hr" my={6} borderColor="gray.200" />

        <Text mt={4} textAlign="center" fontSize="lg" color="gray.700">
          Already have an account?{' '}
          <Button
            variant="link"
            color="gray.500"
            _hover={{ color: "gray.700" }}
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
