import React, { useState } from "react";
import {
  Box,
  Grid,
  VStack,
  Text,
  Heading,
  Icon
} from "@chakra-ui/react";
import { Users } from "react-feather";
import useSWR from "swr";
import GroupSearchSidebar from "./GroupSearchSidebar";
import GroupPost from "./GroupPost";
import CreateGroupPostCard from "./CreateGroupPostCard";

type GroupPostType = {
  groupId: string;
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
  likedBy?: string[];
  timestamp: string;
};

type Group = {
  groupId: string;
  name: string;
  description: string;
  author: string;
  image?: string;
  posts: GroupPostType[];
};

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Groups: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Fetch all groups
  const { data: groups, mutate } = useSWR<Group[]>(
    "http://127.0.0.1:8000/groups",
    fetcher
  );

  // Fetch single group when selectedGroupId changes
  const selectedGroup = groups?.find((group) => group.groupId === selectedGroupId);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handlePostDelete = (postId: string) => {
    if (selectedGroup) {
      // Create a new object to avoid direct state mutation
      const updatedGroup = {
        ...selectedGroup,
        posts: selectedGroup.posts.filter(post => post.postId !== postId)
      };
      
      // Update the groups array with the modified group
      const updatedGroups = groups?.map(group => 
        group.groupId === selectedGroup.groupId ? updatedGroup : group
      );
      
      // Update the SWR cache with the modified data
      mutate(updatedGroups, false);
    }
  };

  return (
    <Box
      bg="gray.50"
      minH="calc(100vh - 40px)" 
      px={6}
      pt={4}
    >
      <Grid 
        templateColumns="400px 1fr" 
        gap={6}
        maxW="1400px" 
        mx="auto"
      >
        {/* Left Sidebar */}
        <Box 
          borderRight="1px" 
          borderColor="gray.200" 
          height="calc(100vh - 40px)" 
          overflowY="auto"
          position="sticky"
          top={4}
          pr={4}
          py={2}
          bg="white"
          borderRadius="md"
          boxShadow="sm"
        >
          <GroupSearchSidebar 
            setGroupId={handleGroupSelect}
            mutate={mutate}
          />
        </Box>

        {/* Main Content */}
        <Box maxW="900px" width="100%">
          {selectedGroupId && selectedGroup ? (
            <VStack spacing={6} align="stretch">
              <Box 
                bg="white" 
                p={6} 
                borderRadius="md" 
                boxShadow="sm"
                borderBottom="1px" 
                borderColor="gray.200"
              >
                <Heading size="lg" mb={3} color="black" fontWeight="bold">
                  {selectedGroup.name}
                </Heading>
                <Text 
                  color="gray.500" 
                  fontSize="md" 
                  maxW="100%" 
                  overflowWrap="break-word" 
                  whiteSpace="pre-wrap"
                  lineHeight="1.6"
                >
                  {selectedGroup.description}
                </Text>
              </Box>
              <CreateGroupPostCard groupId={selectedGroup.groupId} mutate={() => mutate()} />
              {selectedGroup.posts.length > 0 ? (
                [...selectedGroup.posts]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((post: GroupPostType) => (
                    <Box 
                      key={post.postId}
                      bg="white"
                      borderRadius="md" 
                      overflow="hidden"
                      transition="all 0.2s ease-in-out"
                      _hover={{ 
                        transform: 'translateY(-3px)',
                        boxShadow: 'lg'
                      }}
                    >
                      <GroupPost
                        groupId={selectedGroup.groupId}
                        key={post.postId}
                        postId={post.postId}
                        author={post.author}
                        content={post.content}
                        topics={post.topics}
                        images={post.images}
                        likes={post.likes}
                        likedBy={post.likedBy || []}
                        onPostDelete={handlePostDelete}
                      />
                    </Box>
                  ))
              ) : (
                <Box p={6} bg="white" borderRadius="md" boxShadow="sm" textAlign="center">
                  <Text color="gray.500" fontWeight="medium">No posts available in this group.</Text>
                </Box>
              )}
            </VStack>
          ) : (
            <Box 
              p={10} 
              bg="white" 
              borderRadius="lg" 
              boxShadow="md" 
              textAlign="center"
              maxW="800px"
              mx="auto"
              border="1px"
              borderColor="gray.100"
            >
              <VStack spacing={6}>
                <Icon as={Users} size={64} color="gray.300" />
                <Text fontSize="xl" color="gray.600" fontWeight="medium">
                  Select a group to view its details and posts
                </Text>
                <Text fontSize="md" color="gray.400">
                  Join the conversation by choosing a group from the sidebar
                </Text>
              </VStack>
            </Box>
          )}
        </Box>
      </Grid>
    </Box>
  );
};

export default Groups;
