import useSWR from "swr";
import { useState, useEffect } from "react";
import { getFilteredTopics, getTrendingData } from "../Api/getData";
import { deletePostData } from "../Api/deleteData";
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
  ListIcon,
} from "@chakra-ui/react";
import Post from "./Post";
import CreatePostCard from "./CreatePostCard";
import { useAuth } from "../Auth/Auth";
import { TrendingUp } from "react-feather";

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
  const {
    data: posts,
    error,
    mutate,
  } = useSWR<Post[]>(
    "http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/posts",
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
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
        setActivePosts(sortedPosts);
        return;
      }

      const filtered_response = await getFilteredTopics(selectedTopics, toast);
      const sortedFilteredPosts = [...filtered_response].sort((a, b) => {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
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
        [...posts].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    }
  }, [posts]);

  const handleMutate = async () => {
    try {
      const updatedPosts = await mutate(async () => {
        const response = await fetcher(
          "http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/posts"
        );
        return response.sort(
          (a: Post, b: Post) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }, false);

      if (updatedPosts) {
        setActivePosts(updatedPosts);
      }
    } catch (error) {
      console.error("Error fetching new posts:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostData(postId);
      toast({
        title: "Success",
        description: "Post deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refresh posts after deletion
      handleMutate();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
    <Box bg="gray.50" minH="100vh">
      <Grid templateColumns="1fr 2fr 1fr" gap={4} p={4} maxW="1600px" mx="auto">
        {/* Left Column: Search Filters */}
        <Box
          p={4}
          shadow="sm"
          borderRadius="0"
          bg="white"
          position="sticky"
          top="4"
          maxH="80vh"
          overflowY="auto"
        >
          <Heading as="h3" size="md" mb={4} color="gray.700">
            Search Filters
          </Heading>
          <VStack spacing={3} align="start">
            <Checkbox
              colorScheme="gray"
              onChange={() => handleCheckboxChange("Mental Health")}
            >
              Mental Health
            </Checkbox>
            <Checkbox
              colorScheme="gray"
              onChange={() => handleCheckboxChange("Employment")}
            >
              Employment
            </Checkbox>
            <Checkbox
              colorScheme="gray"
              onChange={() => handleCheckboxChange("Substance")}
            >
              Substance
            </Checkbox>
            <Checkbox
              colorScheme="gray"
              onChange={() => handleCheckboxChange("Shelter")}
            >
              Shelter
            </Checkbox>
            <Button
              onClick={filterTopics}
              bgColor="gray.500"
              color="white"
              _hover={{ bgColor: "gray.600" }}
              width="full"
              mt={2}
            >
              Filter Topics
            </Button>
          </VStack>
        </Box>

        {/* Middle Column: Posts */}
        <Box>
          <CreatePostCard mutate={handleMutate} />
          <VStack spacing={4} align="stretch" mt={4}>
            {activePosts?.length > 0 ? (
              activePosts.map((post: Post) => (
                <Box
                  key={post.postId}
                  bg="white"
                  borderRadius="md"
                  overflow="hidden"
                  transition="all 0.2s ease-in-out"
                  _hover={{
                    transform: "translateY(-3px)",
                    boxShadow: "lg",
                  }}
                >
                  <Post
                    postId={post.postId}
                    author={post.author}
                    content={post.content}
                    topics={post.topics}
                    images={post.images}
                    likes={post.likes}
                    likedBy={post.likedBy || []}
                    onDelete={handleDeletePost}
                  />
                </Box>
              ))
            ) : (
              <Box
                p={5}
                shadow="sm"
                borderRadius="md"
                bg="white"
                textAlign="center"
              >
                <Text color="gray.500">No posts available.</Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Right Column: User Info and Trending */}
        <Box
          p={4}
          shadow="sm"
          borderRadius="0"
          bg="white"
          position="sticky"
          top="4"
          maxH="80vh"
          overflowY="auto"
        >
          <Text fontWeight="bold" fontSize="xl" mb={4} color="gray.700">
            Hi {username}!
          </Text>

          {isLoadingTrending ? (
            <Box textAlign="center" py={4}>
              <Spinner size="md" color="gray.500" />
              <Text color="gray.500" mt={2}>
                Loading trending data...
              </Text>
            </Box>
          ) : (
            <>
              {/* Topics Section */}
              <Text fontWeight="bold" mb={3} color="gray.700" fontSize="md">
                Trending Topics
              </Text>
              <List spacing={2} mb={5}>
                {topics.map((topic, index) => (
                  <ListItem
                    key={index}
                    color="gray.700"
                    p={2}
                    borderLeft="3px solid"
                    borderColor="gray.200"
                    _hover={{ borderColor: "gray.400", bg: "gray.50" }}
                    pl={3}
                  >
                    <ListIcon as={TrendingUp} color="gray.500" />
                    {topic}
                  </ListItem>
                ))}
              </List>

              {/* Keywords Section */}
              <Text fontWeight="bold" mb={3} color="gray.700" fontSize="md">
                Trending Keywords
              </Text>
              <List spacing={2}>
                {keywords.map((keyword, index) => (
                  <ListItem
                    key={index}
                    color="gray.700"
                    p={2}
                    borderLeft="3px solid"
                    borderColor="gray.200"
                    _hover={{ borderColor: "gray.400", bg: "gray.50" }}
                    pl={3}
                  >
                    <ListIcon as={TrendingUp} color="gray.500" />
                    {keyword}
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      </Grid>
    </Box>
  );
};

export default Feed;
