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


    // Show success toast based on response data
    toast({
      title: response.data.title || 'Registration Successful',
      description: response.data.message || 'Your account has been created successfully.',
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

    // Show error toast based on response data
    toast({
      title: err.response?.data?.title || 'Registration Failed',
      description: err.response?.data?.message || errorMessages,
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

export interface PostPostParams {
  // postId: string;
  author: string | null;
  content: string;
  topics: string[];
  images: File[];
  // likes: number;
  // likedBy: string[];
}

export const postPostData = async (newPost: PostPostParams) => {
  try {
    const formData = new FormData();
    if (newPost.author) {
      formData.append("author", newPost.author);
    }
    formData.append("content", newPost.content);
    newPost.topics.forEach((topic) => {
      formData.append("topics", topic);
    });

    // Append images to FormData
    newPost.images.forEach((image) => {
      formData.append("images", image);
    });
    await axios.post("http://127.0.0.1:8000/posts/", formData);
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


// Define the GroupData type
export type PostGroupData = {
  groupId: string;
  name: string;
  description: string;
  author: string;
};

// Create a new group
export const postGroupData = async (groupData: PostGroupData): Promise<PostGroupData> => {
  try {
    const response = await axios.post(`http://127.0.0.1:8000/groups/`, groupData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

// Define the Post type
export type Post = {
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
  likedBy: string[];
  createdAt: string;
};

// Define the GroupPostData type
export type PostGroupPostData = {
  groupId: string;
  posts: Post[];
};

// Add a post to a group
export const postGroupPostData = async (groupId: string, post: Post): Promise<Post> => {
  try {
    const response = await axios.post(`http://127.0.0.1:8000/groups/${groupId}/posts`, post, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding post to group:", error);
    throw error;
  }
};


export const postChatCreateRoomData = async (roomId: string, user: string | null) => {
  try {
    await axios.post("http://127.0.0.1:8000/chat/create", { room_id: roomId, user: user });
  } catch (error) {
    console.error("Failed to create post:", error);
    throw error;
  }
};

export const postLikeData = async (postId: string, username: string) => {
  try {
    const response = await axios.post(`http://127.0.0.1:8000/posts/${postId}/like`, {
      username: username
    });
    return response.data;
  } catch (error) {
    console.error("Failed to like post:", error);
    throw error;
  }
};

export const postGroupLikeData = async (groupId: string, postId: string, username: string) => {
  try {
    const response = await axios.post(
      `http://127.0.0.1:8000/groups/${groupId}/posts/${postId}/like`,
      {
        username: username
      }
    );

    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error("Failed to like group post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};



export const postFitnessData = async (username: string, task_id: string) => {
  try {
    const response = await axios.post(`http://127.0.0.1:8000/fitness/${username}/${task_id}/check`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch fitness data:", error);
    throw error;
  }
};

export const postFitnessAddTaskData = async (username: string, newTaskDescription: string) => {
  try {
    const response = await axios.post(`http://127.0.0.1:8000/fitness/${username}/task/add`, {
      description: newTaskDescription,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Failed to add fitness task:", error);
    throw error;
  }
};


// Post a donation to the API
export type DonationData = {
    amount: number;
    message: string;
    cardNumber: string;
    expiryDate: string;
    securityCode: number;
}

export type DonationResponse = {
    success: boolean;
    message: string;
    donationId: string;
    transactionId: string | null
}

export const postDonationData = async (username: string, donationData: DonationData): Promise<DonationResponse> => {
    try {
        const response = await axios.post(`http://127.0.0.1:8000/donations/${username}/donate`, donationData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;

    } catch (error) {
        console.error("Error donating:", error);
        throw error;
    }
}