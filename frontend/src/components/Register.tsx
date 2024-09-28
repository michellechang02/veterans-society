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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  interests: string[];
  employmentStatus: string;
  housingStatus: string;
  workLocation: string;
  liveLocation: string;
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
    housingStatus: '',
    workLocation: '',
    liveLocation: '',
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRadioChange = (
    name: string,
    value: string
  ) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
        <form>
          <Box maxW="md" mx="auto" mt={8} p={4}>
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
                <FormControl id="interests">
                  <FormLabel fontSize="lg">
                    What are your interests?
                  </FormLabel>
                  <Stack spacing={2}>
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
                  </Stack>
                </FormControl>

                <FormControl id="employmentStatus" mt={4}>
                  <FormLabel fontSize="lg">Where do you work?</FormLabel>
                  <RadioGroup
                    name="employmentStatus"
                    onChange={(value: string) =>
                      handleRadioChange('employmentStatus', value)
                    }
                  >
                    <Stack direction="column">
                      <Radio value="Employed">Employed</Radio>
                      <Radio value="Unemployed">No Stable Housing</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                <FormControl id="liveLocation" mt={4}>
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

                <FormControl id="workLocation" mt={4}>
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

                <Stack direction="row" mt={6}>
                  <Button size="lg" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    bgColor="gray.500"
                    color="white"
                    size="lg"
                    ml="auto"
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
