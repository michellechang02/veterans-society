import { useState } from "react";
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
import { Search, Plus, Trash2, Edit } from "react-feather";
import { useAuth } from "../Auth/Auth";
import { postGroupData } from "../Api/postData";
import { getSearchGroupsData } from "../Api/getData";
import { v4 as uuidv4 } from "uuid"; // Import UUID library

interface Group {
  groupId: string;
  author: string;
  name: string;
  description: string;
  image: string;
}



interface GroupSearchSidebarProps {
  setGroupId: (groupId: string) => void;
}

const GroupSearchSidebar: React.FC<GroupSearchSidebarProps> = ({
  setGroupId,
}) => {
  const [input, setInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [newGroupDescription, setNewGroupDescription] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const toast = useToast();
  const { username } = useAuth();

  const fetchSearchResults = async () => {

    console.log(username);
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
      setSearchResults((prev) => [...prev, { ...createdGroup, image: "" }]); // Add to results
      setNewGroupName("");
      setNewGroupDescription("");
      setIsModalOpen(false);

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

  const handleDeleteGroup = (groupId: string) => {
    setSearchResults((prev) => prev.filter((group) => group.groupId !== groupId));
    toast({
      title: "Group Deleted",
      description: "Group was deleted successfully.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpdateGroup = (groupId: string) => {
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

    setSearchResults((prev) =>
      prev.map((group) =>
        group.groupId === groupId
          ? { ...group, name: newGroupName, description: newGroupDescription }
          : group
      )
    );
    setNewGroupName("");
    setNewGroupDescription("");
    toast({
      title: "Group Updated",
      description: "Group was updated successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
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
            <IconButton
              aria-label="Delete Group"
              icon={<Trash2 />}
              colorScheme="red"
              onClick={(e) => {
                e.stopPropagation();  // Prevents triggering the HStack onClick
                handleDeleteGroup(group.groupId);
              }}
            />
            <IconButton
              aria-label="Update Group"
              icon={<Edit />}
              colorScheme="blue"
              onClick={(e) => {
                e.stopPropagation();  // Prevents triggering the HStack onClick
                handleUpdateGroup(group.groupId);
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
