import React, { useState } from "react";
import {
  Box,
  Grid,
  VStack,
  Text,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import useSWR from "swr";
import GroupSearchSidebar from "./GroupSearchSidebar";
import Post from "./Post";
import CreateGroupPostCard from "./CreateGroupPostCard";

type PostType = {
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
  likedBy?: string[];
};

type Group = {
  groupId: string;
  name: string;
  description: string;
  author: string;
  image?: string;
  posts: PostType[];
};

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Groups: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Fetch all groups
  const { data: groups, error, mutate } = useSWR<Group[]>(
    "http://127.0.0.1:8000/groups",
    fetcher
  );

  // Fetch single group when selectedGroupId changes
  const selectedGroup = groups?.find((group) => group.groupId === selectedGroupId);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  
  const renderGroupContent = () => {
    if (!groups && !error) {
      return (
        <Box textAlign="center" py={4}>
          <Spinner size="xl" />
          <Text>Loading group data...</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Text fontSize="lg" color="red.500">
          Failed to load groups.
        </Text>
      );
    }

    if (!selectedGroupId || !selectedGroup) {
      return (
        <Text fontSize="lg" color="gray.500">
          Select a group to view its details and posts.
        </Text>
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        <CreateGroupPostCard groupId={selectedGroup.groupId} mutate={() => mutate()} />
        {selectedGroup.posts.length > 0 ? (
          selectedGroup.posts.map((post: PostType) => (
            <Post
              key={post.postId}
              postId={post.postId}
              author={post.author}
              content={post.content}
              topics={post.topics}
              images={post.images}
              likes={post.likes}
              likedBy={post.likedBy || []}
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
      <GroupSearchSidebar 
        setGroupId={handleGroupSelect}
        mutate={mutate}
      />

      {/* Main Content */}
      <Box p={4}>
        {selectedGroupId && selectedGroup && (
          <>
            <Heading size="lg" mb={2} ml={2}>
              {selectedGroup.name}
            </Heading>
            <Text mb={4} color="gray.600" ml={2}>
              {selectedGroup.description}
            </Text>
          </>
        )}
        {renderGroupContent()}
      </Box>
    </Grid>
  );
};

export default Groups;
