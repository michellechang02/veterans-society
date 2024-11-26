import axios from 'axios';
import { UseToastOptions } from '@chakra-ui/react';


interface PutUserDataParams {
    username: string;
    field: string;
    value: string;
    setUserData: (data: (prev: any) => any) => void;
    setEditableField: (field: string | null) => void;
    toast: (options: UseToastOptions) => void;
}

export const putUserData = async ({
    username,
    field,
    value,
    setUserData,
    setEditableField,
    toast,
  }: PutUserDataParams) => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found.');
      }
  
      const updatedData = { [field]: field === 'interests' ? value.split(', ') : value };
  
      await axios.put(`http://127.0.0.1:8000/users/${username}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      setUserData((prev) => ({
        ...prev,
        [field]: updatedData[field],
      }));
  
      setEditableField(null);
  
      toast({
        title: 'Update successful',
        description: `${field} updated successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : (error as Error).message;
  
      toast({
        title: 'Error updating field',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
