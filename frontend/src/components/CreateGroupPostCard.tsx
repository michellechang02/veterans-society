import React, { useEffect, useRef, useState } from "react";
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
  Image,
  useColorModeValue
} from "@chakra-ui/react";
import { Image as ImageIcon } from "react-feather";
import { useAuth } from "../Auth/Auth";
import { postGroupPostData } from "../Api/postData";
import { v4 as uuidv4 } from "uuid";
import { getUserProfilePic } from "../Api/getData";

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
  const [images, setImages] = useState<File[]>([]);
  const [profilePic, setProfilePic] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { username } = useAuth();

  // Add these color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const buttonBgColor = useColorModeValue("gray.500", "gray.600");
  const buttonColor = useColorModeValue("white", "white");
  const iconColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (username !== null && username !== undefined) {
        try {
          const pfp = await getUserProfilePic(username);
          setProfilePic(pfp);
        } catch (error) {
          console.error("Failed to fetch comments:", error);
        }
      }
    };
  
    fetchProfilePic();
  }, [username]);

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
    <Box shadow="md" p={4} mb={4} bg={bgColor} width="100%" borderColor={borderColor} borderWidth="1px">
      <HStack spacing={4} mb={4}>
        <Avatar name={username!} src={profilePic} />
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          resize="none"
          size="md"
          pt={2}
          color={textColor}
          bg={useColorModeValue("white", "gray.700")}
        />
      </HStack>
      <FormControl mb={4}>
        <FormLabel color={textColor}>Topics</FormLabel>
        <CheckboxGroup
          colorScheme={useColorModeValue("blackAlpha", "gray")}
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
              <Text color={iconColor}>{images.length} image(s) added</Text>
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
        <Button bgColor={buttonBgColor} color={buttonColor} onClick={handleCreatePost}>
          Post
        </Button>
      </HStack>
    </Box>
  );
};

export default CreateGroupPostCard;
