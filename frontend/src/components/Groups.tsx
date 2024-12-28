import React, { useState } from "react";
import {
  Box,
  Grid,
  VStack,
  Text,
  Spinner,
  Heading,
  useToast,
} from "@chakra-ui/react";
import GroupSearchSidebar from "./GroupSearchSidebar";
import Post from "./Post";
import CreatePostCard from "./CreatePostCard";

type PostType = {
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
};

type Group = {
  groupId: string;
  name: string;
  description: string;
  author: string;
  image?: string; // Optional field
  posts: PostType[];
};

// Fetch data dynamically (placeholder example)
const fetchGroupData = async (groupId: string): Promise<Group | null> => {
  // Simulate API call for fetching group data by ID
  try {
    // Example: Replace this with your actual API call logic
    const response = await new Promise<Group>((resolve) => {
      setTimeout(() => {
        resolve({
          groupId,
          name: "Sample Group",
          description: "A sample group for demonstration purposes.",
          author: "john_doe",
          image: "https://bit.ly/dan-abramov",
          posts: [
            {
              postId: "1",
              author: "LeBron James",
              content: "Learning new tech skills!",
              topics: ["Technology"],
              images: ["https://bit.ly/dan-abramov"],
              likes: 10,
            },
          ],
        });
      }, 1000);
    });
    return response;
  } catch (error) {
    console.error("Error fetching group data:", error);
    return null;
  }
};

const Groups: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  const [loadingGroup, setLoadingGroup] = useState<boolean>(false);
  const toast = useToast();

  const handleGroupSelect = async (groupId: string) => {
    setSelectedGroupId(groupId);
    setLoadingGroup(true);
    try {
      const groupData = await fetchGroupData(groupId);
      if (groupData) {
        setGroupInfo(groupData);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch group data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setGroupInfo(null);
      }
    } catch (error) {
      console.error("Error selecting group:", error);
      setGroupInfo(null);
    } finally {
      setLoadingGroup(false);
    }
  };

  const renderGroupContent = () => {
    if (loadingGroup) {
      return (
        <Box textAlign="center" py={4}>
          <Spinner size="xl" />
          <Text>Loading group data...</Text>
        </Box>
      );
    }

    if (!selectedGroupId || !groupInfo) {
      return (
        <Text fontSize="lg" color="gray.500">
          Select a group to view its details and posts.
        </Text>
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        {/* Create Post Card */}
        <CreatePostCard mutate={() => {}} />
        {groupInfo.posts.length > 0 ? (
          groupInfo.posts.map((post: PostType) => (
            <Post
              key={post.postId}
              postId={post.postId}
              author={post.author}
              content={post.content}
              topics={post.topics}
              images={post.images}
              likes={post.likes}
            />
          ))
        ) : (
          <Text>No posts available in this group.</Text>
        )}
      </VStack>
    );
  };

  return (
    <Grid templateColumns="2fr 4fr" gap={4} mt={2}>
      {/* Left Sidebar */}
      <GroupSearchSidebar setGroupId={handleGroupSelect} />

      {/* Main Content */}
      <Box p={4}>
        {selectedGroupId && groupInfo && (
          <>
            <Heading size="lg" mb={2} ml={2}>
              {groupInfo.name}
            </Heading>
            <Text mb={4} color="gray.600" ml={2}>
              {groupInfo.description}
            </Text>
          </>
        )}
        {renderGroupContent()}
      </Box>
    </Grid>
  );
};

export default Groups;
