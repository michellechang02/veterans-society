import axios from 'axios';
import { UseToastOptions } from '@chakra-ui/react';


interface PutUserDataParams {
    username: string;
    field: string;
    value: string | File;
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
  
      // const updatedData = { [field]: field === 'interests' ? value.split(', ') : value };
      const formData = new FormData();
      formData.append(field, field === 'interests' ? value.split(', ') : value);

      const res = await axios.put(`http://127.0.0.1:8000/users/${username}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res)

      if (field == "profilePic") {
        setUserData((prev) => ({
          ...prev,
          ["profilePic"]: res.data.profilePic,
        }));
      } else {
        setUserData((prev) => ({
          ...prev,
          [field]: formData.get(field),
        }));
      }
  
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


  type UpdatePostParams = {
    content?: string;
    likes?: number;
    topics?: string[];
    images?: string[];
    likedBy?: string[];
    createdAt?: string;
  };
  
  export const putPostData = async (postId: string, updateFields: UpdatePostParams) => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found.');
      }
  
      // Construct the payload for updating post fields
      const payload: Record<string, any> = {};
      if (updateFields.content) {
        payload.content = updateFields.content;
      }
      if (updateFields.likes !== undefined) {
        payload.likes = updateFields.likes;
      }
      if (updateFields.topics) {
        payload.topics = updateFields.topics;
      }
      if (updateFields.images) {
        payload.images = updateFields.images;
      }
      if (updateFields.likedBy) {
        payload.likedBy = updateFields.likedBy;
      }
      if (updateFields.createdAt) {
        payload.createdAt = updateFields.createdAt;
      }
  
      if (Object.keys(payload).length === 0) {
        throw new Error('No fields provided for update.');
      }
  
      const response = await axios.put(
        `http://127.0.0.1:8000/posts/${postId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Failed to update post ${postId}:`, error);
      return { success: false, error };
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
  }[];
};

  export const putGroupData = async (groupId: string, groupData: GroupData): Promise<GroupData> => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/groups/${groupId}`, groupData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating group:", error.message);
      throw new Error(error.response?.data?.detail || "Failed to update group");
    }
  };

  export type GroupInfoData = {
    groupId: string;
    name: string;
    description: string;
  }

  export const putGroupInfoData = async (groupId: string, name: string, description: string) : Promise<GroupInfoData> => {
    try {
      const response = await axios.put<GroupData>(
        `http://127.0.0.1:8000/groups/${groupId}/update-info`,
        { name, description },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      return response.data;
    } catch (error: any) {
      console.error("Error updating group:", error.message);
      throw new Error(error.response?.data?.detail || "Failed to update group");
    }
  }

  export const putJoinRoomData = async (roomId: string, user: string | null): Promise<void> => {
    try {
      await axios.put(`http://localhost:8000/chat/join`, { room_id: roomId, user });
    } catch (error: any) {
      console.error("Failed to join room:", error);
      throw new Error(error.response?.data?.detail || "Failed to join chat");
    }
  };

  export const putLeaveRoomData = async (roomId: string, user: string | null): Promise<void> => {
    try {
      await axios.put(`http://localhost:8000/chat/leave`, { room_id: roomId, user });
    } catch (error: any) {
      console.error("Failed to leave room:", error);
      throw new Error(error.response?.data?.detail || "Failed to join chat");
    }
  };
