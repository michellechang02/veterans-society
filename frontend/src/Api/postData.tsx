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


  interface LoginResponse {
    access_token: string;
  }
  
  export const postLogin = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post<LoginResponse>(
        "http://127.0.0.1:8000/users/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );
  
      return response.data; // Return the login response data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        if (error.response && error.response.data) {
          throw new Error(`Login failed: ${error.response.data.detail}`);
        } else {
          throw new Error("An unexpected error occurred during login.");
        }
      } else {
        console.error("Non-Axios error:", error);
        throw new Error("An unexpected error occurred.");
      }
    }
  };

  interface PostPostParams {
    postId: string; // UUID for the post
    author: string | null // Username of the author
    content: string; // Content of the post
    topics: string[]; // Array of topics
    images: string[]; // Array of image URLs
    likes: number; // Number of likes (default to 0)
  }

  export const postPostData = async (newPost: PostPostParams) => {
    try {
      await axios.post("http://127.0.0.1:8000/posts/", newPost);
      return { success: true };
    } catch (error) {
      console.error("Failed to create post:", error);
      return { success: false, error };
    }
  };


  export const postCommentData = async (
    postId: string,
    username: string | null,
    newComment: string
  ) => {
    if (!newComment.trim()) {
      throw new Error("Comment cannot be empty");
    }
  
    const commentData = {
      commentId: crypto.randomUUID(),
      postId,
      author: username, // Replace with actual username or null
      content: newComment.trim(),
    };
  
    try {
      // Send POST request to the API
      await axios.post("http://127.0.0.1:8000/comments/", commentData);
      return commentData; // Return the created comment data
    } catch (error) {
      console.error("Failed to add comment:", error);
      throw error; // Rethrow the error to handle it in the caller
    }
  };



