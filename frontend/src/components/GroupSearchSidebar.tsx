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
} from "@chakra-ui/react";
import axios from "axios";

interface Group {
  groupId: number;
  name: string;
  description: string;
  image: string;
}

interface GroupSearchSidebarProps {
  setGroupId: (groupId: number) => void;
}

const GroupSearchSidebar: React.FC<GroupSearchSidebarProps> = ({
  setGroupId,
}) => {
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLoading(true);
      try {
        // TODO: Replace the URL with the actual backend endpoint once implemented
        // const response = await axios.get(`http://127.0.0.1:8000/groups/search?query=${input}`);
        // setSearchResults(response.data);
        setSearchResults([
          {
            groupId: 1,
            name: "Veterans Support",
            description:
              "A group for veterans to connect and support each other.",
            image: "https://bit.ly/dan-abramov",
          },
          {
            groupId: 2,
            name: "Job Training for Veterans",
            description: "A group focused on career development for veterans.",
            image: "https://bit.ly/dan-abramov",
          },
        ]); // Example static data for now
      } catch (error) {
        console.error("Error fetching group search results:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResultClick = (groupId: number) => {
    setGroupId(groupId);
  };

  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      w="64"
      h="full"
      p={4}
      bg="white"
      shadow="md"
    >
      {/* Search Input */}
      <Input
        placeholder="Search groups"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleSearch}
        mb={4}
      />
      {loading && <Spinner size="sm" />}
      {/* Search Results */}
      <VStack align="start" spacing={4}>
        {searchResults.map((group) => (
          <HStack
            key={group.groupId}
            spacing={4}
            cursor="pointer"
            onClick={() => handleResultClick(group.groupId)}
          >
            <Avatar src={group.image} name={group.name} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">{group.name}</Text>
              <Text fontSize="sm" color="gray.600">
                {group.description}
              </Text>
            </VStack>
          </HStack>
        ))}
        {searchResults.length === 0 && !loading && (
          <Text color="gray.500" mt={4}>
            No groups found.
          </Text>
        )}
      </VStack>
      <Divider mt={4} />
    </Box>
  );
};

export default GroupSearchSidebar;
