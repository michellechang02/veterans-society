import useSWR from "swr";
import { useState, useEffect } from 'react';
import { getFilteredTopics } from '../Api/getData';
import axios from "axios";
import {
  Box,
  VStack,
  Spinner,
  Text,
  Grid,
  Heading,
  Checkbox,
  Button,
  useToast
} from "@chakra-ui/react";
import Post from "./Post";
import CreatePostCard from "./CreatePostCard";
import { useAuth } from "../Auth/Auth";

interface Post {
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
}


const fetcher = (url: string) => axios.get(url).then((res) => res.data);



const Feed = () => {
  const toast = useToast();
  const { data: posts, error, mutate } = useSWR<Post[]>(
    "http://127.0.0.1:8000/posts",
    fetcher
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[] | null>(null);
  const [activePosts, setActivePosts] = useState<Post[]>([]);

  const { username } = useAuth();

  const handleCheckboxChange = (topic: string) => {
    setSelectedTopics((prevSelected) => {
      const updatedTopics = prevSelected.includes(topic)
        ? prevSelected.filter((t) => t !== topic) // Remove if already selected
        : [...prevSelected, topic]; // Add if not selected
  
      // If no topics are selected, reset to show all posts
      if (updatedTopics.length === 0) {
        setFilteredPosts(null);
        setActivePosts(posts || []); // Revert to all posts
      }
  
      return updatedTopics;
    });
  };

  const filterTopics = async () => {
    try {
      const filtered_response = await getFilteredTopics(selectedTopics, toast);
      setFilteredPosts(filtered_response);
      setActivePosts(filtered_response);
    } catch (error: any) {
      console.error("Error fetching filtered posts.");
    }
  };

  // Update active posts only if no filter is applied
  useEffect(() => {
    if (!filteredPosts) {
      setActivePosts(posts || []);
    }
  }, [posts, filteredPosts]);

  const handleMutate = async () => {
    await mutate();
    if (!filteredPosts) {
      // Update active posts only if no filter is applied
      setActivePosts(posts || []);
    }
  };

  if (error) {
    return (
      <Box textAlign="center" py={4} color="red.500">
        <Text>Failed to load posts. Please try again later.</Text>
      </Box>
    );
  }

  if (!posts && !filteredPosts) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="xl" />
        <Text>Loading posts...</Text>
      </Box>
    );
  }

  return (
    <Grid templateColumns="1fr 2fr 1fr" gap={4} p={4}>
      {/* Left Column: Search Filters */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
        <Heading as="h3" size="md" mb={4}>
          Search Filters
        </Heading>
        <VStack spacing={4} align="start">
          <Checkbox onChange={() => handleCheckboxChange("Mental Health")}>
            Mental Health
          </Checkbox>
          <Checkbox onChange={() => handleCheckboxChange("Employment")}>
            Employment
          </Checkbox>
          <Checkbox onChange={() => handleCheckboxChange("Substance")}>
            Substance
          </Checkbox>
          <Checkbox onChange={() => handleCheckboxChange("Shelter")}>
            Shelter
          </Checkbox>
          <Button onClick={filterTopics} colorScheme="blackAlpha">
            Filter Topics
          </Button>
        </VStack>
      </Box>

      {/* Middle Column: Posts */}
      <Box pb={4} px={4}>
        <CreatePostCard mutate={handleMutate} />
        <VStack spacing={4} align="stretch">
          {activePosts?.length > 0 ? (
            activePosts.map((post: Post) => (
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
            <Text>No posts available.</Text>
          )}
        </VStack>
      </Box>

      {/* Right Column: User Info and Goals */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
        <Text fontWeight="bold" fontSize="lg" mb={4}>
          Hi {username}!
        </Text>
        <Heading as="h4" size="md" mb={4}>
          Today's Goals
        </Heading>
        <Text fontWeight="bold" mb={2}>
          Exercise:
        </Text>
        <VStack spacing={2} align="start">
          <Checkbox>Goal 1</Checkbox>
          <Checkbox>Goal 2</Checkbox>
          <Checkbox>Goal 3</Checkbox>
        </VStack>
        <Text fontWeight="bold" mt={4} mb={2}>
          Nutrition:
        </Text>
        <VStack spacing={2} align="start">
          <Checkbox>Goal 1</Checkbox>
          <Checkbox>Goal 2</Checkbox>
        </VStack>
      </Box>
    </Grid>
  );
};

export default Feed;

