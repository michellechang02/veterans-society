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
}

const UserSearch: React.FC = () => {
  const [searchUsername, setSearchUsername] = useState(() => {
    return sessionStorage.getItem('searchUsername') || "";
  });
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = sessionStorage.getItem('users');
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
            lastName: user.lastName
          })));
          sessionStorage.setItem('users', JSON.stringify(data));
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
            lastName: user.lastName
          })));
          sessionStorage.setItem('users', JSON.stringify(data.slice(0, 5)));
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
      sessionStorage.removeItem('users');
    }
    setSearchUsername(newSearchUsername);
    sessionStorage.setItem('searchUsername', newSearchUsername);

    if (newSearchUsername === "") {
      const fetchTopUsers = async () => {
        setIsLoading(true);
        try {
          if (logged_in_username) {
            const data = await searchUsers(logged_in_username, "");
            setUsers(data.slice(0, 5).map(user => ({
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName
            })));
            sessionStorage.setItem('users', JSON.stringify(data.slice(0, 5)));
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
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" mb={4}>
          <Heading size="lg" mb={2}>Find Veterans</Heading>
          <Text color="gray.600">Connect with other veterans in the community</Text>
        </Box>

        <Card variant="outline">
          <CardBody>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Box as={Search} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by name..."
                value={searchUsername}
                onChange={handleSearchChange}
                variant="filled"
                bg="gray.50"
                _hover={{ bg: "gray.100" }}
                _focus={{ bg: "white", borderColor: "blue.400" }}
              />
            </InputGroup>
          </CardBody>
        </Card>

        {isLoading && (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" color="blue.500" thickness="3px" />
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
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <HStack spacing={4}>
                    <Avatar
                      size="md"
                      name={`${user.firstName} ${user.lastName}`}
                      bg="blue.500"
                    />
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text color="gray.600" fontSize="sm">
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
            bg="gray.50"
            borderRadius="lg"
          >
            <Text color="gray.600" fontSize="lg">
              No users found matching your search
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
export default UserSearch;
