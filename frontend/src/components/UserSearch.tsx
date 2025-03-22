import {
  Box,
  Input,
  Text,
  InputGroup,
  InputLeftElement,
  Spinner,
  Container,
  Heading,
  VStack,
  Avatar,
  HStack,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { Search } from "react-feather";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/Auth";
import { searchUsers } from '../Api/getData';

interface User {
  username: string;
  firstName: string;
  lastName: string;
  profilePic: string;
}

const UserSearch: React.FC = () => {
  const [searchUsername, setSearchUsername] = useState(() => {
    return localStorage.getItem('searchUsername') || "";
  });
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { username: logged_in_username } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        if (logged_in_username) {
          const data = await searchUsers(logged_in_username, searchUsername);
          setUsers(data.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePic: user.profilePic
          })));
          localStorage.setItem('users', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTopUsers = async () => {
      setIsLoading(true);
      try {
        if (logged_in_username) {
          const data = await searchUsers(logged_in_username, "");
          setUsers(data.slice(0, 5).map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePic: user.profilePic
          })));
          localStorage.setItem('users', JSON.stringify(data.slice(0, 5)));
        }
      } catch (error) {
        console.error('Error fetching top users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchUsername) {
      const timeoutId = setTimeout(fetchUsers, 300);
      return () => clearTimeout(timeoutId);
    } else if (users.length === 0) {
      fetchTopUsers();
    }
  }, [searchUsername, logged_in_username, users.length]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchUsername = e.target.value;
    if (newSearchUsername !== searchUsername) {
      localStorage.removeItem('users');
    }
    setSearchUsername(newSearchUsername);
    localStorage.setItem('searchUsername', newSearchUsername);

    if (newSearchUsername === "") {
      const fetchTopUsers = async () => {
        setIsLoading(true);
        try {
          if (logged_in_username) {
            const data = await searchUsers(logged_in_username, "");
            setUsers(data.slice(0, 5).map(user => ({
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              profilePic: user.profilePic
            })));
            localStorage.setItem('users', JSON.stringify(data.slice(0, 5)));
          }
        } catch (error) {
          console.error('Error fetching top users:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTopUsers();
    }
  };

  const handleUserClick = (username: string) => {
    navigate(`/${logged_in_username}/visit/${username}`);
  };

  return (
    <Box bg="gray.50" minH="100vh" w="100%">
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" mb={4}>
            <Heading size="lg" mb={2} color="black">Find Veterans</Heading>
            <Text color="gray.500">Connect with other veterans in the community</Text>
          </Box>

          <Card boxShadow="md" bg="white">
            <CardBody>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Box as={Search} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name..."
                  value={searchUsername}
                  onChange={handleSearchChange}
                  variant="filled"
                  bg="white"
                  _hover={{ bg: "gray.50" }}
                  _focus={{ bg: "white", borderColor: "black" }}
                />
              </InputGroup>
            </CardBody>
          </Card>

          {isLoading && (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" color="black" thickness="3px" />
            </Box>
          )}

          {users.length > 0 && (
            <VStack spacing={3}>
              {users.map((user) => (
                <Card
                  key={user.username}
                  w="100%"
                  cursor="pointer"
                  onClick={() => handleUserClick(user.username)}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                  bg="white"
                  boxShadow="md"
                >
                  <CardBody>
                    <HStack spacing={4}>
                      <Avatar
                        size="md"
                        name={`${user.firstName} ${user.lastName}`}
                        bg="gray.500"
                        color="white"
                        src={user.profilePic}
                      />
                      <Box>
                        <Text fontWeight="bold" fontSize="lg" color="black">
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text color="gray.500" fontSize="sm">
                          Click to view profile
                        </Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}

          {!isLoading && searchUsername && users.length === 0 && (
            <Box
              textAlign="center"
              py={8}
              px={4}
              bg="white"
              borderRadius="lg"
              boxShadow="md"
            >
              <Text color="gray.500" fontSize="lg">
                No users found matching your search
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
export default UserSearch;
