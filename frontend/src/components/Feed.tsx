import useSWR from "swr";
import { useState, useEffect } from 'react';
import { getFilteredTopics, getTrendingData } from '../Api/getData';
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
  likedBy: string[];
  timestamp: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const Feed = () => {
  const toast = useToast();
  const { data: posts, error, mutate } = useSWR<Post[]>(
    "http://127.0.0.1:8000/posts",
    fetcher
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [activePosts, setActivePosts] = useState<Post[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  const { username } = useAuth();

  const handleCheckboxChange = (topic: string) => {
    setSelectedTopics((prevSelected) => {
      if (prevSelected.includes(topic)) {
        return prevSelected.filter((t) => t !== topic);
      }
      return [...prevSelected, topic];
    });
  };

  const filterTopics = async () => {
    try {
      if (selectedTopics.length === 0) {
        // If no topics selected, show all posts sorted
        const sortedPosts = [...(posts || [])].sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        setActivePosts(sortedPosts);
        return;
      }

      const filtered_response = await getFilteredTopics(selectedTopics, toast);
      const sortedFilteredPosts = [...filtered_response].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      setActivePosts(sortedFilteredPosts);
    } catch (error: any) {
      console.error("Error fetching filtered posts:", error);
      toast({
        title: "Error",
        description: "Failed to filter posts. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Sort posts when they're loaded or filtered
  useEffect(() => {
    if (posts) {
      setActivePosts(
        [...posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      );
    }
  }, [posts]);

  const handleMutate = async () => {
    try {
      const updatedPosts = await mutate(async () => {
        const response = await fetcher("http://127.0.0.1:8000/posts");
        return response.sort((a: Post, b: Post) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }, false);

      if (updatedPosts) {
        setActivePosts(updatedPosts);
      }
    } catch (error) {
      console.error("Error fetching new posts:", error);
    }
  };



  const [topics, setTopics] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  const fetchTrendingData = async () => {
    setIsLoadingTrending(true);
    try {
      const { topics, keywords } = await getTrendingData();
      setTopics(topics);
      setKeywords(keywords);
      mutate();
    } catch (error) {
      console.error("Error loading trending data:", error);
      toast({
        title: "Error",
        description: "Failed to load trending data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingTrending(false);
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

  if (!posts && !topics && !keywords) {
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
      <Box
        p={4}
        maxH="300px"
        shadow="md"
        position="sticky"
        top="4" /* Adjust the top value for spacing from the viewport top */
      >
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
          <Button onClick={filterTopics} bgColor="gray.500" color="white">
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
                likedBy={post.likedBy || []}
              />
            ))
          ) : (
            <Text>No posts available.</Text>
          )}
        </VStack>
      </Box>

      {/* Right Column: User Info and Goals */}
      <Box
        p={4}
        maxH="350px"
        shadow="md"
        position="sticky"
        top="4" /* Adjust the top value for spacing from the viewport top */
      >
        <Text fontWeight="bold" fontSize="lg" mb={4}>
          Hi {username}!
        </Text>

        {isLoadingTrending ? (
          <Box textAlign="center" py={4}>
            <Spinner size="md" />
            <Text>Loading trending data...</Text>
          </Box>
        ) : (
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
        )}
      </Box>
    </Grid>

  );
};

export default Feed;
