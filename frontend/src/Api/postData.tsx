import axios from "axios";
import { UseToastOptions } from "@chakra-ui/react";

interface PostUserParams {
  formData: any;
  setErrors: (errors: string | null) => void;
  navigate: (path: string) => void;
  toast: (options: UseToastOptions) => void;
  setAuth: {
    setAuthUsername: (username: string | null) => void;
    setAuthToken: (token: string | null) => void;
    setIsAdmin: (isAdmin: boolean) => void;
    setAuth: (isAuthenticated: boolean) => void;
  };
}

export const postUser = async ({
  formData,
  setErrors,
  navigate,
  toast,
  setAuth,
}: PostUserParams) => {
  setErrors(null);

  // Additional frontend validation
  if (formData.isVeteran) {
    const requiredVeteranFields = [
      "employmentStatus",
      "liveLocation",
      "weight",
      "height",
    ];

    // Only check workLocation if employed
    if (formData.employmentStatus === "Employed" && !formData.workLocation) {
      setErrors("Work location is required for employed veterans.");
      toast({
        title: "Validation Error",
        description: "Work location is required for employed veterans.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Check other required fields
    for (const field of requiredVeteranFields) {
      if (!formData[field] && formData[field] !== 0) {
        setErrors(
          `Please fill out all required fields for veterans (${field} is missing).`
        );
        toast({
          title: "Validation Error",
          description: `Please fill out all required fields for veterans (${field} is missing).`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }
  }

  try {
    // Prepare payload differently based on veteran status
    const payload = {
      ...formData,
      interests: formData.interests || [], // Always include interests array
      isVeteran: formData.isVeteran || false,
      email: formData.email !== "" ? formData.email : null,
    };

    // Only include veteran-specific fields if user is a veteran
    if (formData.isVeteran) {
      payload.workLocation = formData.workLocation || "";
      payload.employmentStatus = formData.employmentStatus || "";
      payload.liveLocation = formData.liveLocation || "";
      payload.weight = formData.weight || 0;
      payload.height = formData.height || 0;
    }

    const response = await axios.post(
      "http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/users/register",
      payload
    );

    // Show success toast based on response data
    toast({
      title: response.data.title || "Registration Successful",
      description:
        response.data.message || "Your account has been created successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Automatically log in the user
    try {
      const loginResponse = await postLogin(
        formData.username,
        formData.password
      );

      // Store the token and role in localStorage
      localStorage.setItem("token", loginResponse.access_token);
      localStorage.setItem("role", loginResponse.role);
      localStorage.setItem("username", formData.username);
      localStorage.setItem("authToken", loginResponse.access_token);
      localStorage.setItem("loginTime", Date.now().toString());

      // Update auth context - ensure correct admin status is set
      setAuth.setAuthUsername(formData.username);
      setAuth.setAuthToken(loginResponse.access_token);
      setAuth.setIsAdmin(loginResponse.role === "admin");
      setAuth.setAuth(true);

      console.log("Auto-login successful with role:", loginResponse.role);

      // Navigate to user's feed page after successful login
      navigate(`/${formData.username}/feed`);
    } catch (loginError) {
      console.error("Auto-login failed:", loginError);

      // Show error toast for auto-login failure
      toast({
        title: "Auto-login Failed",
        description:
          "Registration was successful, but we could not automatically log you in. Please log in manually.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });

      // If auto-login fails, redirect to login page as fallback
      navigate("/login");
    }
  } catch (err: any) {
    let errorMessages = "An unexpected error occurred.";
    if (err.response && err.response.data && err.response.data.detail) {
      errorMessages =
        typeof err.response.data.detail === "string"
          ? err.response.data.detail
          : err.response.data.detail.map((error: any) => error.msg).join(", ");
    }

    setErrors(errorMessages);

    // Show error toast based on response data
    toast({
      title: err.response?.data?.title || "Registration Failed",
      description: err.response?.data?.message || errorMessages,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};

interface LoginResponse {
  access_token: string;
  role: string;
}

export const postLogin = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      "http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/users/login",
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
  author: string | null;
  content: string;
  topics: string[];
  images: File[];
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
    await axios.post(
      "http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/posts/",
      formData
    );
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
    await axios.post(
      "http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/comments/",
      commentData
    );
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
  image: File | null;
};

export type PostGroupDataResponse = {
  groupId: string;
  name: string;
  description: string;
  author: string;
  image: string;
};

// Create a new group
export const postGroupData = async (
  groupData: PostGroupData
): Promise<PostGroupDataResponse> => {
  try {
    // Create FormData object
    const formData = new FormData();

    // Add text fields
    formData.append("groupId", groupData.groupId);
    formData.append("name", groupData.name);
    formData.append("description", groupData.description);
    formData.append("author", groupData.author);

    // Add image file if it exists
    if (groupData.image) {
      formData.append("image", groupData.image);
    }

    const response = await axios.post(
      "http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/groups/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // This is important for file uploads
        },
      }
    );

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
  images: File[];
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
export const postGroupPostData = async (
  groupId: string,
  post: Post
): Promise<Post> => {
  try {
    const formData = new FormData();

    // Add text fields
    if (post.postId) formData.append("postId", post.postId);
    if (post.author) formData.append("author", post.author);
    formData.append("content", post.content);

    // Add topics
    if (post.topics && post.topics.length) {
      post.topics.forEach((topic) => {
        formData.append("topics", topic);
      });
    } else {
      formData.append("topics", "general");
    }

    // Add images
    if (post.images && post.images.length) {
      post.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    // Include other fields
    formData.append("likes", post.likes.toString());
    formData.append("createdAt", post.createdAt);

    const response = await axios.post(
      `http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/groups/${groupId}/posts`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding post to group:", error);
    throw error;
  }
};

export const postChatCreateRoomData = async (
  roomId: string,
  user: string | null
) => {
  try {
    await axios.post(
      "http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/chat/create",
      { room_id: roomId, user: user }
    );
  } catch (error) {
    console.error("Failed to create post:", error);
    throw error;
  }
};

export const postLikeData = async (postId: string, username: string) => {
  try {
    const response = await axios.post(
      `http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/posts/${postId}/like`,
      {
        username: username,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to like post:", error);
    throw error;
  }
};

export const postGroupLikeData = async (
  groupId: string,
  postId: string,
  username: string
) => {
  try {
    const response = await axios.post(
      `http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/groups/${groupId}/posts/${postId}/like`,
      {
        username: username,
      }
    );

    return {
      success: true,
      ...response.data,
    };
  } catch (error) {
    console.error("Failed to like group post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const postFitnessData = async (username: string, task_id: string) => {
  try {
    const response = await axios.post(
      `http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/fitness/${username}/${task_id}/check`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch fitness data:", error);
    throw error;
  }
};

export const postFitnessAddTaskData = async (
  username: string,
  newTaskDescription: string
) => {
  try {
    const response = await axios.post(
      `http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/fitness/${username}/task/add`,
      {
        description: newTaskDescription,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add fitness task:", error);
    throw error;
  }
};
