import useSWR from "swr";
import axios from "axios";
import {
  Box,
  VStack,
  Spinner,
  Text,
  Grid,
  Heading,
  Checkbox,
} from "@chakra-ui/react";
import Post from "./Post";
import CreatePostCard from "./CreatePostCard";

interface Post {
  postId: string;
  author: string;
  content: string;
  topics: string[];
  images: string[];
  likes: number;
}


const fetcher = (url: string) => axios.get(url).then((res) => res.data);


  const username = 'michellechang02'

const Feed = () => {
  const { data: posts, error, mutate } = useSWR("http://127.0.0.1:8000/posts", fetcher);

  if (error) {
    return (
      <Box textAlign="center" py={4} color="red.500">
        <Text>Failed to load posts. Please try again later.</Text>
      </Box>
    );
  }

  if (!posts) {
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
          <Checkbox>Mental Health</Checkbox>
          <Checkbox>Employment</Checkbox>
          <Checkbox>Substance</Checkbox>
          <Checkbox>Shelter</Checkbox>
        </VStack>
      </Box>

      <Box pb={4} px={4}>
        <CreatePostCard mutate={mutate} username={username} />
    <VStack spacing={4} align="stretch">
  {posts.length > 0 ? (
    posts.map((post: Post) => (
      <Post
        key={post.postId}
        postId={post.postId}
        author={post.author}
        content={post.content}
        topics={post.topics}
        images={post.images}
        likes={post.likes}
        username={username}
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

        {/* Exercise Goals */}
        <Text fontWeight="bold" mb={2}>
          Exercise:
        </Text>
        <VStack spacing={2} align="start">
          <Checkbox>goal 1</Checkbox>
          <Checkbox>goal 2</Checkbox>
          <Checkbox>goal 3</Checkbox>
          <Checkbox>goal 4</Checkbox>
          <Checkbox>goal 5</Checkbox>
        </VStack>

        {/* Nutrition Goals */}
        <Text fontWeight="bold" mt={4} mb={2}>
          Nutrition:
        </Text>
        <VStack spacing={2} align="start">
          <Checkbox>goal 1</Checkbox>
          <Checkbox>goal 2</Checkbox>
        </VStack>
      </Box>
    </Grid>
  );
};

export default Feed;
