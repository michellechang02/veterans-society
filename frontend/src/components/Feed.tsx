import {
  Box,
  Checkbox,
  Grid,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { Search } from "react-feather";
import useSWR from "swr";
import Post from "./Post";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const Feed = () => {
  // TODO: Uncomment API call when done to replace sample response
  // const { data: posts, mutate } = useSWR('http://127.0.0.1:8000/posts/feed', fetcher);
  const posts = [
    {
      postId: 0,
      author: "Jim Halpert",
      content: "These are my new headshots!",
      topics: "Employment",
      image: "https://bit.ly/dan-abramov",
      likes: 2,
      profileImage: "https://bit.ly/dan-abramov",
      comments: [
        {
          author: "Dwight Schrute",
          content: "Identity theft is not a joke, Jim!",
        },
        {
          author: "Michael Scott",
          content: "Nice!",
        },
      ],
    },
    {
      postId: 1,
      author: "Pam Beasley",
      content: "These are my husband's new headshots!",
      topics: "Employment",
      image: "https://bit.ly/dan-abramov",
      likes: 2,
      profileImage: "https://bit.ly/dan-abramov",
      comments: [
        {
          author: "Ryan",
          content: "Cool!",
        },
        {
          author: "Stanley",
          content: "Wow!",
        },
      ],
    }
  ];
  const mutate = null;

  const firstName = "Michelle";
  const lastName = "Chang";

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

      {/* Middle Column: Input and Feed/Posts */}
      <Box pb={4} px={4}>
        <HStack mb={4}>
          <Input placeholder="Search..." />
          <IconButton aria-label="Search" icon={<Icon as={Search} />} />
        </HStack>
        <VStack spacing={4} align="stretch">
          {posts &&
            posts.map((post) => (
              <Post key={post.postId} post={post} mutate={mutate} />
            ))}
        </VStack>
      </Box>

      {/* Right Column: User Info and Goals */}
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
        <Text fontWeight="bold" fontSize="lg" mb={4}>
          Hi {firstName} {lastName}!
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
