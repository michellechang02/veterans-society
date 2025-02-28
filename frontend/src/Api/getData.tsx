import axios from 'axios';
import { UseToastOptions, useToast } from '@chakra-ui/react';


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

export const getUserProfilePic = async (username: string) => {
  const token = sessionStorage.getItem('authToken');

  try {
    if (!token) {
      throw new Error('Authentication token not found.');
    }

    const response = await axios.get(`http://127.0.0.1:8000/users/pic/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token in the Authorization header
      },
    });

    return response.data.profilePic
  } catch (error: unknown) {
    const message =
      axios.isAxiosError(error) && error.response?.data?.detail
        ? error.response.data.detail
        : (error as Error).message;
    console.log(message)
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

interface Post {
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
  likedBy: string[];
  timestamp: string;
}

export const getFilteredTopics = async (selectedTopics: string[], toast: ReturnType<typeof useToast>) => {
  try {
    const encodedTopics = selectedTopics.join(",");
    const response = await axios.get<Post[]>(
      "http://127.0.0.1:8000/posts/filter/topics",
      {
        params: { topics: encodedTopics },
      }
    );

    // Show success toast
    toast({
      title: "Filtered Successfully",
      description: `${response.data.length} posts fetched for the selected topics.`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching posts:", error.response?.data || error.message);

    // Show error toast
    toast({
      title: "Failed to Fetch Posts",
      description: error.response?.data?.detail || "An error occurred while fetching posts.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });

    throw error;
  }
};

type TrendingData = {
  topics: string[];
  keywords: string[];
};

export const getTrendingData = async (): Promise<TrendingData> => {
  try {
    // Fetch trending topics
    const topicsResponse = await axios.get("http://127.0.0.1:8000/posts/trends/trending-topics");
    const topicsData = topicsResponse.data;

    // Fetch trending keywords
    const keywordsResponse = await axios.get("http://127.0.0.1:8000/posts/trends/trending-keywords");
    const keywordsData = keywordsResponse.data;


    // Get only the first 3 topics and keywords
    return {
      topics: topicsData.trending_topics.slice(0, 3).map(([topic]: [string, number]) => topic),
      keywords: keywordsData.trending_keywords.slice(0, 2).map(([keyword]: [string, number]) => keyword),
    };
  } catch (error) {
    console.error("Error fetching trending data:", error);
    throw error;
  }
};



// Define the GroupData type
export type GroupData = {
  groupId: string;
  name: string;
  description: string;
  author: string;
  image: string;
  posts: {
    postId: string;
    author: string;
    content: string;
    topics: string[];
    images: string[];
    likes: number;
    likedBy: string[];
  }[];
};


// Get all groups
export const getGroupsData = async (): Promise<GroupData[]> => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/groups/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching groups data:", error.message);
    throw new Error(error.response?.data?.detail || "Failed to fetch groups data");
  }
};


// Function to get all groups or search for specific groups based on a query
export const getSearchGroupsData = async (query?: string): Promise<GroupData[]> => {
  try {
    // Construct the URL for searching groups
    const url = query
      ? `http://127.0.0.1:8000/groups/search/?query=${encodeURIComponent(query)}`
      : `http://127.0.0.1:8000/groups/search/`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;  // Return the data received from the API
  } catch (error: any) {
    console.error("Error fetching groups data:", error.message);
    throw new Error(error.response?.data?.detail || "Failed to fetch groups data");
  }
};

export const getChatRoomsData = async (user: string | null) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/chat?user=${user}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch chat rooms:", error);
    throw error;
  }
};

interface MessageProp {
  timestamp: number,
  message: string,
  author: string,
  room_id: string
}

export const getChatMessagesData = async (roomId: string) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/chat/messages`,
      { params: { room_id: roomId } }
    );
    const newMessages = response.data.map((msg: MessageProp) => {
      const { room_id, ...otherFields } = msg;
      void room_id
      return otherFields;
    });
    return newMessages
  } catch (error) {
    console.error("Failed to fetch chat rooms:", error);
    throw error;
  }
};

export const getChatRoomMembersData = async (roomId: string) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/chat/users`,
      { params: { room_id: roomId } }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch members: ", error);
    throw error;
  }
};


interface VeteranResource {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

export async function getVeteranResources(lat: number, lon: number): Promise<VeteranResource[]> {
  try {
    const response = await fetch(`http://localhost:8000/overpass/veteran-resources?lat=${lat}&lon=${lon}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();


    // Transform the API response into an array of VeteranResource objects
    const resources: VeteranResource[] = data.elements
      .filter((element: any) => element.tags && element.tags['name']) // Only include resources with a valid name
      .map((element: any) => {
        const tags = element.tags || {};
        return {
          id: element.id,
          name: tags['name'],
          latitude: element.lat,
          longitude: element.lon,
          address: `${tags['addr:housenumber'] || ''} ${tags['addr:street'] || ''}, ${tags['addr:city'] || ''}, ${tags['addr:state'] || ''} ${tags['addr:postcode'] || ''}`.trim()
        };
      });

    return resources;
  } catch (error) {
    console.error('Error fetching veteran resources:', error);
    throw error;
  }
}

interface SearchUserResponse {
  username: string;
  firstName: string;
  lastName: string;
  isVeteran: boolean;
  profilePic: string;
}

export const searchUsers = async (logged_in_username: string, query: string): Promise<SearchUserResponse[]> => {
  try {
    const response = await axios.get<SearchUserResponse[]>(
      `http://127.0.0.1:8000/users/${logged_in_username}/search?query=${query}`
    );
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

interface GetOtherUserDataParams {
  username: string;
  setUserData: (data: any) => void;
  toast: (options: UseToastOptions) => void;
}

export const getOtherUserData = async ({
  username,
  setUserData,
  toast,
}: GetOtherUserDataParams) => {
  const token = sessionStorage.getItem('authToken');

  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/users/${username}/visit`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token in the Authorization header
      },
    });

    if (response.status === 200) {
      setUserData(response.data);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    if (toast) {
      toast({
        title: 'Error',
        description: 'Could not fetch user data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }
};