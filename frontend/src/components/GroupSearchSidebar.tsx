import { useState } from "react";
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
  Spacer,
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
  mutate: () => void;
}

const GroupSearchSidebar: React.FC<GroupSearchSidebarProps> = ({
  setGroupId,
}) => {
  // Add mutate prop from Groups component
  const { mutate } = useSWR<Group[]>("http://127.0.0.1:8000/groups", fetcher);
  const [input, setInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [newGroupDescription, setNewGroupDescription] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const toast = useToast();
  const { username } = useAuth();

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
    };

    try {
      const createdGroup = await postGroupData(newGroupData); // Call backend to create group
      setSearchResults((prev) => [...prev, { ...createdGroup, image: "", posts: [] }]); // Add to results with empty posts array
      setNewGroupName("");
      setNewGroupDescription("");
      setIsModalOpen(false);
      
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

  const handleUpdateGroup = async (updatedGroup: { groupId: string; name: string; description: string }): Promise<void> => {
    const { groupId, name, description } = updatedGroup;
  
    try {
      await putGroupInfoData(groupId, name, description);
      
      // Update the local searchResults state
      setSearchResults(prev => 
        prev.map(group => 
          group.groupId === groupId 
            ? { ...group, name, description }
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

  return (
    <Box ml={4} maxH="100vh" p={4} bg="white" shadow="md">
      {/* Add Group Button */}
      <Button
        bgColor="gray.500"
        color="white"
        leftIcon={<Plus />}
        onClick={() => setIsModalOpen(true)} // Open modal on button click
        width="100%"
      >
        Add Group
      </Button>

      {/* Add Group Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="New Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Input
                placeholder="New Group Description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button bgColor="gray.500" color="white" onClick={handleAddGroup}>
              Add Group
            </Button>
            <Button onClick={() => setIsModalOpen(false)} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Divider mt={4} mb={4} />
      {/* Search Input and Button */}
      <HStack mb={4}>
        <Input
          placeholder="Search groups"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchSearchResults()}
        />
        <IconButton
          aria-label="Search"
          icon={<Search />}
          bgColor="gray.500"
          color="white"
          onClick={fetchSearchResults}
        />
      </HStack>
      {loading && <Spinner size="sm" />}
      {/* Search Results */}
      <VStack align="start" spacing={4}>
        {searchResults.map((group) => (
          <HStack
          key={group.groupId}
          alignItems="center"
          cursor="pointer"
          onClick={() => setGroupId(group.groupId)}
          width="100%"  // Ensures the HStack takes up the full width
        >
          <HStack spacing={4}>
            <Avatar src={group.image} name={group.name} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">{group.name}</Text>
              <Text fontSize="sm" color="gray.600">
                {group.description}
              </Text>
            </VStack>
          </HStack>
        
          <Spacer />  {/* Pushes the following content (IconButtons) to the right */}
          
          <HStack spacing={2}>
            <UpdateGroupModal 
              group={group} 
              onUpdateGroup={handleUpdateGroup}
              mutate={mutate}
            />
            <IconButton
              aria-label="Delete Group"
              icon={<Trash2 />}
              colorScheme="red"
              onClick={(e) => {
                e.stopPropagation();  // Prevents triggering the HStack onClick
                handleDeleteGroup(group.groupId);
              }}
            />
          </HStack>
        </HStack>
        ))}
        {searchResults.length === 0 && !loading && (
          <Text color="gray.500" mt={4}>
            No groups found.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default GroupSearchSidebar;
