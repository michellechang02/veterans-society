import axios from 'axios';
import { UseToastOptions } from '@chakra-ui/react';

interface GetUserDataParams {
    username: string;
    setUserData: (data: any) => void;
    toast: (options: UseToastOptions) => void;
  }

export const getUserData = async ({
    username,
    setUserData,
    toast,
  }: GetUserDataParams) => {
    const token = sessionStorage.getItem('authToken');
  
    try {
      if (!token) {
        throw new Error('Authentication token not found.');
      }
  
      const response = await axios.get(`http://127.0.0.1:8000/users/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
      });
  
      setUserData(response.data);
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : (error as Error).message;
  
      toast({
        title: 'Error fetching user data',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  interface Comment {
    commentId: string;
    postId: string;
    author: string | null;
    content: string;
  }

  export const getCommentData = async (postId: string) => {
    try {
      const response = await axios.get<Comment[]>(
        `http://127.0.0.1:8000/comments/${postId}`
      );
      return response.data; // Return the fetched comments
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      throw error; // Rethrow error for caller to handle
    }
  };