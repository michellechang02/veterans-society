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
import { useAuth } from "../Auth/Auth";
import { postGroupPostData } from "../Api/postData";
import { v4 as uuidv4 } from "uuid";

interface CreateGroupPostCardProps {
  groupId: string; // The group ID to associate the post with
  mutate: () => void; // Function to refresh the group's posts
}

const CreateGroupPostCard: React.FC<CreateGroupPostCardProps> = ({
  groupId,
  mutate,
}) => {
  const [content, setContent] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const toast = useToast();
  const { username } = useAuth();

  const handleCreatePost = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please write something to create a post.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!username) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newPost = {
      postId: uuidv4(),
      author: username,
      content,
      topics, // Keep topics as an array
      images, // Keep images as an array
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    try {
      // Pass the groupId and the newPost to the API call
      await postGroupPostData(groupId, newPost);
      mutate(); // Refresh group's posts

      setContent("");
      setTopics([]);
      setImages([]);

      toast({
        title: "Post Created",
        description: "Your post has been added to the group.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error Creating Post",
        description: "There was an error creating your post. Please try again.",
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
    <Box shadow="md" p={4} mb={4} bg="white" width="100%">
      <HStack spacing={4} mb={4}>
        <Avatar />
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          resize="none"
          size="md"
          pt={2}
        />
      </HStack>
      <FormControl mb={4}>
        <FormLabel>Topics</FormLabel>
        <CheckboxGroup
          colorScheme="blackAlpha"
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
        <Button bgColor="gray.500" color="white" onClick={handleCreatePost}>
          Post
        </Button>
      </HStack>
    </Box>
  );
};

export default CreateGroupPostCard;
