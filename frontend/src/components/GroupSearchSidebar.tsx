import { useRef, useState } from "react";
import useSWR from "swr";
import {
  Box,
  Input,
  VStack,
  HStack,
  Avatar,
  Text,
  Spinner,
  Divider,
  IconButton,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorModeValue
} from "@chakra-ui/react";
import { Search, Plus, Trash2 } from "react-feather";
import { useAuth } from "../Auth/Auth";
import { postGroupData } from "../Api/postData";
import { getSearchGroupsData } from "../Api/getData";
import { putGroupInfoData } from "../Api/putData";
import { deleteGroupData } from "../Api/deleteData";
import { v4 as uuidv4 } from "uuid"; // Import UUID library
import UpdateGroupModal from "./UpdateGroupModal";

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Group {
  groupId: string;
  author: string;
  name: string;
  description: string;
  image: string;
}

interface GroupSearchSidebarProps {
  setGroupId: (groupId: string) => void;
  mutate?: () => void;
}

const GroupSearchSidebar: React.FC<GroupSearchSidebarProps> = ({
  setGroupId,
  mutate: externalMutate,
}) => {
  // Use SWR for fetching groups
  const { mutate: swrMutate } = useSWR<Group[]>("http://127.0.0.1:8000/groups", fetcher);
  const mutate = externalMutate || swrMutate;
  
  const [input, setInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [newGroupDescription, setNewGroupDescription] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const toast = useToast();
  const { username } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File|null>(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("black", "white");
  const subtleColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const buttonBgColor = useColorModeValue("gray.500", "gray.600");
  const buttonHoverBgColor = useColorModeValue("gray.600", "gray.500");
  const itemHoverBgColor = useColorModeValue("gray.100", "gray.700");

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const searchedGroups = await getSearchGroupsData(input);
      setSearchResults(searchedGroups);
    } catch (error) {
      console.error("Error fetching group search results:", error);
      toast({
        title: "Error",
        description: "Unable to fetch groups.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName || !newGroupDescription) {
      toast({
        title: "Validation Error",
        description: "Group name and description cannot be empty.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!username) {
      toast({
        title: "Error",
        description: "You must be logged in to add a group.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newGroupData = {
      groupId: uuidv4(),
      name: newGroupName,
      description: newGroupDescription,
      author: username,
      image
    };

    try {
      const createdGroup = await postGroupData(newGroupData); // Call backend to create group
      setSearchResults((prev) => [...prev, { ...createdGroup, posts: [] }]); // Add to results with empty posts array
      setNewGroupName("");
      setNewGroupDescription("");
      setIsModalOpen(false);
      setImage(null);
      
      // Set the newly created group as selected and refresh the groups data
      setGroupId(createdGroup.groupId);
      mutate(); // Refresh SWR cache to get the new group data

      toast({
        title: "Group Created",
        description: `Group "${newGroupName}" was created successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      // Call the API to delete the group
      await deleteGroupData(groupId);
  
      // Update the search results by removing the deleted group
      setSearchResults((prev) => prev.filter((group) => group.groupId !== groupId));
      
      // Refresh the SWR cache to update the UI
      mutate();
  
      // Show a success toast notification
      toast({
        title: "Group Deleted",
        description: "Group was deleted successfully.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting group:", error);
  
      // Show an error toast notification
      toast({
        title: "Error Deleting Group",
        description: "Failed to delete the group. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateGroup = async (updatedGroup: { groupId: string; name: string; description: string; image: File | null }): Promise<void> => {
    const { groupId, name, description, image } = updatedGroup;
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and description cannot be empty",
        status: "error",
      });
      return;
    }
  
    try {
      const response = await putGroupInfoData(groupId, name, description, image);
      
      // Update the local searchResults state
      setSearchResults(prev => 
        prev.map(group => 
          group.groupId === groupId 
            ? { ...group, name, description, image: response.image }
            : group
        )
      );

      // Refresh the SWR cache
      mutate();
      
      // Show success toast with updated fields
      toast({
        title: "Group Updated",
        description: `Updated fields: Name - "${name}", Description - "${description}".`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error Updating Group",
        description: `Failed to update the group. Error: ${errorMessage}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw new Error(errorMessage);
    }
  };

  // Add this function to reset the file input when removing the image
  const handleRemoveImage = () => {
    setImage(null);
    
    // Reset the file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box 
      maxH="calc(100vh - 40px)" 
      p={5} 
      bg={bgColor}
      borderRadius="lg"
      overflow="hidden"
      width="100%"
      display="flex"
      flexDirection="column"
      sx={{
        '&::-webkit-scrollbar': {
          width: '8px',
          borderRadius: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: subtleColor,
          borderRadius: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: useColorModeValue('gray.100', 'gray.600'),
          borderRadius: '8px',
        },
      }}
    >
      <Text fontSize="xl" fontWeight="bold" mb={4} color={textColor}>Groups</Text>
      
      {/* Add Group Button */}
      <Box flexShrink={0} mb={4}>
        <Button
          bgColor={buttonBgColor}
          color={useColorModeValue("white", "gray.100")}
          leftIcon={<Plus />}
          onClick={() => setIsModalOpen(true)}
          width="100%"
          _hover={{ bg: buttonHoverBgColor, transform: "translateY(-2px)" }}
          _active={{ bg: useColorModeValue("gray.700", "gray.400") }}
          boxShadow="sm"
          transition="all 0.2s"
          borderRadius="md"
          height="40px"
        >
          Add Group
        </Button>
      </Box>

      {/* Add Group Modal */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }}>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader color={textColor}>Add New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="New Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                borderColor={borderColor}
                _focus={{ borderColor: subtleColor }}
                bg={inputBgColor}
                color={textColor}
              />
              <Input
                placeholder="New Group Description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                borderColor={borderColor}
                _focus={{ borderColor: subtleColor }}
                bg={inputBgColor}
                color={textColor}
              />
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Button
                aria-label='add profile picture'
                bgColor="blue.500"
                color="white"
                onClick={handleAddImage}
                variant="ghost"
              >
                Upload Group Profile Picture
              </Button>

              {/* Display selected image filename */}
              {image && (
                <HStack mt={2} p={2} bg={useColorModeValue("gray.100", "gray.700")} borderRadius="md">
                  <Text fontSize="sm" color={textColor}>{image.name}</Text>
                  <IconButton
                    aria-label="Remove image"
                    icon={<Trash2 size={16} />}
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={handleRemoveImage}
                  />
                </HStack>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button bgColor={buttonBgColor} color="white" onClick={handleAddGroup}>
              Add Group
            </Button>
            <Button onClick={() => setIsModalOpen(false)} ml={3} variant="outline" borderColor={subtleColor} color={textColor}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Divider my={5} borderColor={borderColor} />
      
      {/* Search Input and Button */}
      <HStack mb={5} width="100%" spacing={2}>
        <Input
          placeholder="Search groups"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchSearchResults()}
          borderColor={borderColor}
          _focus={{ borderColor: subtleColor, boxShadow: `0 0 0 1px ${subtleColor}` }}
          borderRadius="md"
          fontSize="sm"
          bg={inputBgColor}
          color={textColor}
        />
        <IconButton
          aria-label="Search"
          icon={<Search size={18} />}
          bgColor={buttonBgColor}
          color="white"
          onClick={fetchSearchResults}
          _hover={{ bg: buttonHoverBgColor }}
          borderRadius="md"
        />
      </HStack>
      
      {loading && (
        <Box textAlign="center" py={2}>
          <Spinner size="sm" color={subtleColor} thickness="2px" />
        </Box>
      )}
      
      {/* Search Results */}
      <Box overflowY="auto" flex="1">
        <VStack align="start" spacing={3} width="100%">
          {searchResults.map((group) => (
            <Box
              key={group.groupId}
              cursor="pointer"
              onClick={() => setGroupId(group.groupId)}
              width="100%"
              p={3}
              borderRadius="md"
              transition="all 0.2s"
              _hover={{ bg: itemHoverBgColor, transform: "translateY(-2px)" }}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
              bg={bgColor}
            >
              <HStack width="100%" justifyContent="space-between">
                <HStack spacing={4} overflow="hidden">
                  <Avatar 
                    src={group.image} 
                    name={group.name} 
                    size="md" 
                    bgColor={buttonBgColor}
                    color="white"
                  />
                  <VStack align="start" spacing={0} overflow="hidden" maxW="calc(100% - 60px)">
                    <Text fontWeight="bold" fontSize="md" color={textColor}>
                      {group.name}
                    </Text>
                    <Text 
                      fontSize="xs" 
                      color={subtleColor}
                      noOfLines={2} 
                      maxW="100%" 
                      overflowWrap="break-word"
                      textOverflow="ellipsis"
                    >
                      {group.description}
                    </Text>
                  </VStack>
                </HStack>
              
                <HStack spacing={2} flexShrink={0}>
                  <UpdateGroupModal 
                    group={group} 
                    onUpdateGroup={handleUpdateGroup}
                    mutate={mutate}
                  />
                  <IconButton
                    aria-label="Delete Group"
                    icon={<Trash2 size={16} />}
                    bg={buttonBgColor}
                    color="white"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group.groupId);
                    }}
                    _hover={{ bg: buttonHoverBgColor }}
                  />
                </HStack>
              </HStack>
            </Box>
          ))}
          {searchResults.length === 0 && !loading && (
            <Box 
              width="100%" 
              textAlign="center" 
              py={8} 
              color={subtleColor}
              borderRadius="md"
              borderWidth="1px"
              borderStyle="dashed"
              borderColor={borderColor}
              bg={bgColor}
            >
              <Text fontSize="sm">No groups found</Text>
              <Text fontSize="xs" mt={1}>Try a different search term or create a new group</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default GroupSearchSidebar;
