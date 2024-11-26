import axios from 'axios';
import { UseToastOptions } from '@chakra-ui/react';

interface PostUserParams {
    formData: any;
    setErrors: (errors: string | null) => void;
    navigate: (path: string) => void;
    toast: (options: UseToastOptions) => void;
  }

  export const postUser = async ({
    formData,
    setErrors,
    navigate,
    toast,
  }: PostUserParams) => {
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
        toast({
          title: 'Validation Error',
          description: "Please fill out all required fields for veterans.",
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }
  
    try {
      const payload = {
        ...formData,
        interests: formData.interests, // Already an array
        workLocation: formData.workLocation || '',
        employmentStatus: formData.employmentStatus || '',
        liveLocation: formData.liveLocation || '',
        weight: formData.weight,
        height: formData.height,
        isVeteran: formData.isVeteran || false,
        email: formData.email !== '' ? formData.email : null,
      };
  
      const response = await axios.post('http://127.0.0.1:8000/users/register', payload);
      console.log(response.data);
  
      // Show success toast
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
  
      navigate('/login'); // Redirect to login after successful registration
    } catch (err: any) {
      let errorMessages = 'An unexpected error occurred.';
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessages = err.response.data.detail.map((error: any) => error.msg).join(', ');
      }
  
      setErrors(errorMessages);
  
      // Show error toast
      toast({
        title: 'Registration Failed',
        description: errorMessages,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

