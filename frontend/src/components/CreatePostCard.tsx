import React, { useState } from "react";
import {
  Box,
  HStack,
  Avatar,
  Button,
  Textarea,
  IconButton,
  FormControl,
  FormLabel,
  CheckboxGroup,
  Checkbox,
  useToast,
  Text,
} from "@chakra-ui/react";
import { Image as ImageIcon } from "react-feather";
import axios from "axios";

interface CreatePostCardProps {
  mutate: () => void; // Function to refresh the posts data
  username: string;
}

const CreatePostCard: React.FC<CreatePostCardProps> = ({ mutate, username }) => {
  const [content, setContent] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const toast = useToast();

  const handleCreatePost = async () => {
    if (!content.trim()) {
      toast({
        title: "Content is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const newPost = {
        postId: crypto.randomUUID(),
        author: username,
        content,
        topics, // Send as array; backend will handle as set
        images, // Send as array; backend will handle as set
        likes: 0,
      };

      await axios.post("http://127.0.0.1:8000/posts/", newPost);
      mutate(); // Refresh posts data
      setContent("");
      setTopics([]);
      setImages([]);
      toast({
        title: "Post created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: "Failed to create post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddImage = () => {
    const url = prompt("Enter image URL:");
    if (url) setImages([...images, url]);
  };

  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      p={4}
      mb={4}
      bg="white"
      width="100%" // Ensures the component takes full width
    >
      <HStack spacing={4} mb={4}>
        <Avatar name={username} />
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          resize="none"
          size="sm"
        />
      </HStack>
      <FormControl mb={4}>
        <FormLabel>Topics</FormLabel>
        <CheckboxGroup
          colorScheme="teal"
          value={topics}
          onChange={(value) => setTopics(value as string[])}
        >
          <HStack spacing={4}>
            <Checkbox value="Mental Health">Mental Health</Checkbox>
            <Checkbox value="Employment">Employment</Checkbox>
            <Checkbox value="Substance">Substance</Checkbox>
            <Checkbox value="Shelter">Shelter</Checkbox>
          </HStack>
        </CheckboxGroup>
      </FormControl>
      <HStack justifyContent="space-between">
        <HStack>
          <IconButton
            aria-label="Add Image"
            icon={<ImageIcon />}
            onClick={handleAddImage}
            variant="ghost"
          />
          {images.length > 0 && (
            <Text color="gray.500">{images.length} image(s) added</Text>
          )}
        </HStack>
        <Button colorScheme="teal" onClick={handleCreatePost}>
          Post
        </Button>
      </HStack>
    </Box>
  );
};

export default CreatePostCard;