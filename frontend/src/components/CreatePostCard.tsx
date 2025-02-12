import React, { useRef, useState } from "react";
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
  Flex,
  Image
} from "@chakra-ui/react";
import { Image as ImageIcon } from "react-feather";
import { useAuth } from "../Auth/Auth";
import { postPostData } from "../Api/postData";
import { v4 as uuidv4 } from "uuid";

interface CreatePostCardProps {
  mutate: () => void; // Function to refresh the posts data
}

const CreatePostCard: React.FC<CreatePostCardProps> = ({ mutate }) => {
  const [content, setContent] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { username } = useAuth();

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
  
    const newPost = {
      postId: uuidv4(),
      author: username,
      content,
      topics, // Send as array; backend will handle as set
      images, // Send as array; backend will handle as set
      likes: 0,
      likedBy: [],
    };
  
    const response = await postPostData(newPost);
  
    if (response.success) {
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
    } else {
      toast({
        title: "Failed to create post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle button click to trigger file input
  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files; // Get all selected files
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => file); // Convert FileList to array of File objects
      setImages((prevImages) => [...prevImages, ...newImages]); // Add new images to state
    }
  };

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <Box
      shadow="md"
      p={4}
      mb={4}
      bg="white"
      width="100%" // Ensures the component takes full width
    >
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
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*" // Restrict to image files
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            multiple // Allow multiple file selection
          />

          {/* IconButton to trigger file input */}
          <IconButton
            aria-label="Add Images"
            icon={<ImageIcon />}
            onClick={handleAddImage}
            variant="ghost"
          />
          {images.length > 0 && (
            <Text color="gray.500">{images.length} image(s) added</Text>
          )}
          {/* Display selected images */}
          <Flex mt={4} flexWrap="wrap" gap={2}>
            {images.map((image, index) => (
              <Box key={index} position="relative">
                <Image
                  src={URL.createObjectURL(image)} // Create a URL for preview
                  alt={`Selected ${index + 1}`}
                  boxSize="100px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <Button
                  size="xs"
                  position="absolute"
                  top={1}
                  right={1}
                  onClick={() => handleRemoveImage(index)}
                >
                  ×
                </Button>
              </Box>
            ))}
          </Flex>
        </HStack>
        <Button bgColor="gray.500" color="white" onClick={handleCreatePost}>
          Post
        </Button>
      </HStack>
    </Box>
  );
};

export default CreatePostCard;
