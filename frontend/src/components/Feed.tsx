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
  useToast,
  List,
  ListItem,
  ListIcon
} from "@chakra-ui/react";
import Post from "./Post";
import CreatePostCard from "./CreatePostCard";
import { useAuth } from "../Auth/Auth";
import { TrendingUp } from 'react-feather'

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

  const [topics, setTopics] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  // Simulated API call to fetch trending topics and keywords
  const fetchTrendingData = async () => {
    try {
      // Replace with actual API calls
      const fetchedTopics = ["Mental Health", "Employment", "Substance Abuse"];
      const fetchedKeywords = ["Veteran Support", "VA Benefits"];
      
      // Simulate a delay (for demonstration purposes)
      setTimeout(() => {
        setTopics(fetchedTopics);
        setKeywords(fetchedKeywords);
      }, 1000);
    } catch (error) {
      console.error("Error fetching trending data:", error);
    }
  };

  useEffect(() => {
    fetchTrendingData();
  }, []);

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
      <Box  p={4} maxH="300px" shadow="md">
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
          <Button onClick={filterTopics}  bgColor="gray.500" color="white">
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
      <Box p={4} maxH="350px" shadow="md">
        <Text fontWeight="bold" fontSize="lg" mb={4}>
          Hi {username}!
        </Text>

        <>
          {/* Topics Section */}
          <Text fontWeight="bold" mb={4} color="gray.700">
            Trending Topics
          </Text>
          <List spacing={3}>
            {topics.map((topic, index) => (
              <ListItem key={index} color="gray.600">
                <ListIcon as={TrendingUp} color="teal.500" />
                {topic}
              </ListItem>
            ))}
          </List>

          {/* Keywords Section */}
          <Text fontWeight="bold" mt={6} mb={2} color="gray.700">
            Trending Keywords
          </Text>
          <List spacing={3}>
            {keywords.map((keyword, index) => (
              <ListItem key={index} color="gray.600">
                <ListIcon as={TrendingUp} color="teal.500" />
                {keyword}
              </ListItem>
            ))}
          </List>
        </>

      </Box>
    </Grid>
  );
};

export default Feed;

