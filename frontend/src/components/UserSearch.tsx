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
  useColorModeValue,
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

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("black", "white");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const inputHoverBgColor = useColorModeValue("gray.50", "gray.600");
  const inputFocusBorderColor = useColorModeValue("black", "blue.300");
  const spinnerColor = useColorModeValue("black", "white");
  const nameColor = useColorModeValue("black", "white");
  const avatarBgColor = useColorModeValue("gray.500", "gray.600");

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
    <Box bg={bgColor} minH="100vh" w="100%">
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" mb={4}>
            <Heading size="lg" mb={2} color={headingColor}>Find Veterans</Heading>
            <Text color={textColor}>Connect with other veterans in the community</Text>
          </Box>

          <Card boxShadow="md" bg={cardBgColor}>
            <CardBody>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Box as={Search} color={textColor} />
                </InputLeftElement>
                <Input
                  placeholder="Search by name..."
                  value={searchUsername}
                  onChange={handleSearchChange}
                  variant="filled"
                  bg={inputBgColor}
                  _hover={{ bg: inputHoverBgColor }}
                  _focus={{ bg: inputBgColor, borderColor: inputFocusBorderColor }}
                />
              </InputGroup>
            </CardBody>
          </Card>

          {isLoading && (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" color={spinnerColor} thickness="3px" />
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
                  bg={cardBgColor}
                  boxShadow="md"
                >
                  <CardBody>
                    <HStack spacing={4}>
                      <Avatar
                        size="md"
                        name={`${user.firstName} ${user.lastName}`}
                        bg={avatarBgColor}
                        color="white"
                        src={user.profilePic}
                      />
                      <Box>
                        <Text fontWeight="bold" fontSize="lg" color={nameColor}>
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text color={textColor} fontSize="sm">
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
              bg={cardBgColor}
              borderRadius="lg"
              boxShadow="md"
            >
              <Text color={textColor} fontSize="lg">
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
