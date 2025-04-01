import axios from 'axios';
import { UseToastOptions, useToast } from '@chakra-ui/react';


interface GetUserDataParams {
  username: string;
  setUserData: (data: any) => void;
  toast: (options: UseToastOptions) => void;
  checkAdmin?: boolean;
}

export const getUserData = async ({
  username,
  setUserData,
  toast,
  checkAdmin = false,
}: GetUserDataParams) => {
  const token = localStorage.getItem('authToken');

  try {
    if (!token) {
      throw new Error('Authentication token not found.');
    }

    const response = await axios.get(`http://127.0.0.1:8000/users/${username}/visit`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true  // Add this for cookies if needed
    });

    // Store the user data - using visit endpoint which guarantees consistent field structure
    const userData = response.data;

    // Ensure all required fields have default values if they're missing
    const processedData = {
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      username: userData.username || '',
      password: '', // Password is not returned from API
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      interests: userData.interests || [],
      employmentStatus: userData.employmentStatus || '',
      workLocation: userData.workLocation || '',
      liveLocation: userData.liveLocation || '',
      isVeteran: userData.isVeteran || false,
      weight: userData.weight || 0,
      height: userData.height || 0,
      profilePic: userData.profilePic || '',
      isAdmin: checkAdmin ? (userData.isAdmin || false) : false
    };

    setUserData(processedData);
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
  const token = localStorage.getItem('authToken');

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
    timestamp: string;
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

    console.log(response.data)
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
    // First load without geocoding for faster initial response
    const response = await fetch(`http://localhost:8000/overpass/veteran-resources?lat=${lat}&lon=${lon}&geocode=true`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the API response into an array of VeteranResource objects
    const resources: VeteranResource[] = data.elements
      .filter((element: any) => element.tags && element.tags['name']) // Only include resources with a valid name
      .map((element: any) => {
        const tags = element.tags || {};

        // Try to get address from various sources in order of preference
        let address = '';

        // 1. Use generated_address if available (from backend reverse geocoding)
        if (tags['generated_address']) {
          address = tags['generated_address'];
        }
        // 2. Construct from addr tags if available
        else if (tags['addr:street']) {
          address = `${tags['addr:housenumber'] || ''} ${tags['addr:street'] || ''}, ${tags['addr:city'] || ''}, ${tags['addr:state'] || ''} ${tags['addr:postcode'] || ''}`.trim();
        }

        return {
          id: element.id,
          name: tags['name'],
          latitude: element.lat,
          longitude: element.lon,
          address: address || 'Address not available'
        };
      });

    // Start address enrichment immediately but don't wait for it
    // This way we return the basic data right away
    if (resources.some(r => r.address === 'Address not available')) {
      // Create deep copies to avoid reference issues
      const resourcesCopy = resources.map(r => ({ ...r }));
      enrichAddresses(resourcesCopy, lat, lon);
    }

    return resources;
  } catch (error) {
    console.error('Error fetching veteran resources:', error);
    throw error;
  }
}

// Function to enrich addresses in the background
async function enrichAddresses(resources: VeteranResource[], lat: number, lon: number) {
  try {
    // Get the full data with geocoding
    const response = await fetch(`http://localhost:8000/overpass/veteran-resources?lat=${lat}&lon=${lon}&geocode=true`);
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const elementsMap = new Map();
    let hasUpdates = false;

    // Create a map of id -> element for quick lookup
    data.elements.forEach((element: any) => {
      if (element.id && element.tags) {
        elementsMap.set(element.id, element);
      }
    });

    // Create a completely new array of resources with updated addresses
    const updatedResources = resources.map(resource => {
      // Start with a copy of the original resource
      const newResource = { ...resource };

      if (resource.address === 'Address not available') {
        const element = elementsMap.get(resource.id);
        if (element?.tags?.generated_address) {
          newResource.address = element.tags.generated_address;
          hasUpdates = true;
        }
      }

      return newResource;
    });

    // Only update if we found new addresses
    if (hasUpdates) {
      // Find all references to the resources array and update them
      // This is a bit of a hack, but it works to update any references to the original array
      for (let i = 0; i < resources.length; i++) {
        resources[i] = updatedResources[i];
      }
    }
  } catch (error) {
    console.warn('Background address enrichment failed:', error);
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
  const token = localStorage.getItem('authToken');

  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/users/${username}/visit`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token in the Authorization header
      },
      withCredentials: true
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

export const getAllUsers = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`http://127.0.0.1:8000/users/admin/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    });

    // Return the list of users
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching all users:', error);
    const message =
      axios.isAxiosError(error) && error.response?.data?.detail
        ? error.response.data.detail
        : (error as Error).message;
    throw new Error(`Failed to fetch users: ${message}`);
  }
};

export interface FormLink {
  link: string;
}

export const getAllFormLinks = async (): Promise<FormLink[]> => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/forms/get_all_forms', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all form links:', error);
    throw error;
  }
};