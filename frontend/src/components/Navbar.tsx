import { Box, VStack, useMediaQuery, Image, Avatar, Button, IconButton, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';
import { useEffect, useState } from 'react';
import { getUserProfilePic } from '../Api/getData';
import { LogOut, LogIn, Home, Users, MessageCircle, Grid, Activity, Search, Heart, BookOpen } from 'react-feather';

const Navbar: React.FC = () => {
  const [isDesktop] = useMediaQuery('(min-width: 50em)');
  const navigate = useNavigate();
  const { username, logout } = useAuth();
  const [profilePic, setProfilePic] = useState<string>('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (username) {
        try {
          const pfp = await getUserProfilePic(username);
          setProfilePic(pfp);
        } catch (error) {
          console.error("Failed to fetch profile picture:", error);
        }
      }
    };

    fetchProfilePic();
  }, [username]);

  return (
    <Box 
      as="nav" 
      bg="white" 
      boxShadow="lg" 
      width="200px" 
      height="100vh" 
      position="fixed" 
      left={0} 
      top={0} 
      py={4}
      px={3}
      borderRight="1px"
      borderColor="gray.200"
      display="flex"
      flexDirection="column"
    >
      {/* Logo Section */}
      <Flex 
        align="center" 
        mb={6} 
        p={3} 
        borderRadius="md"
        bgColor="gray.50"
      >
        <Image 
          src="/vite.png" 
          alt="Veterans Society" 
          boxSize="36px" 
          mr={3} 
          borderRadius="full"
          shadow="sm"
        />
        <Text 
          fontWeight="bold" 
          fontSize="lg" 
          color="gray.700"
          letterSpacing="tight"
        >
          Veterans Society
        </Text>
      </Flex>

      {/* Navigation Buttons */}
      {isDesktop && (
        <VStack align="start" spacing={2} width="100%" flex="1">
          <Button
            leftIcon={<Home size={18} />}
            onClick={() => navigate(`/`)}
            variant="ghost"
            borderRadius="md"
            _hover={{ bg: 'gray.100', color: 'gray.700' }}
            color="gray.500"
            justifyContent="flex-start"
            width="100%"
            size="md"
            py={5}
          >
            Home
          </Button>
          
          {username && (
            <>
              <Button
                leftIcon={<Grid size={18} />}
                onClick={() => navigate(`/${username}/feed`)}
                variant="ghost"
                borderRadius="md"
                _hover={{ bg: 'gray.100', color: 'gray.700' }}
                color="gray.500"
                justifyContent="flex-start"
                width="100%"
                size="md"
                py={5}
              >
                Feed
              </Button>
              <Button
                leftIcon={<MessageCircle size={18} />}
                onClick={() => navigate(`/${username}/chat`)}
                variant="ghost"
                borderRadius="md"
                _hover={{ bg: 'gray.100', color: 'gray.700' }}
                color="gray.500"
                justifyContent="flex-start"
                width="100%"
                size="md"
                py={5}
              >
                Chat
              </Button>
              <Button
                leftIcon={<Users size={18} />}
                onClick={() => navigate(`/${username}/groups`)}
                variant="ghost"
                borderRadius="md"
                _hover={{ bg: 'gray.100', color: 'gray.700' }}
                color="gray.500"
                justifyContent="flex-start"
                width="100%"
                size="md"
                py={5}
              >
                Groups
              </Button>
              <Button
                leftIcon={<Activity size={18} />}
                onClick={() => navigate(`/${username}/fitness`)}
                variant="ghost"
                borderRadius="md"
                _hover={{ bg: 'gray.100', color: 'gray.700' }}
                color="gray.500"
                justifyContent="flex-start"
                width="100%"
                size="md"
                py={5}
              >
                Fitness
              </Button>
              <Button
                leftIcon={<Search size={18} />}
                onClick={() => navigate(`/${username}/search`)}
                variant="ghost"
                borderRadius="md"
                _hover={{ bg: 'gray.100', color: 'gray.700' }}
                color="gray.500"
                justifyContent="flex-start"
                width="100%"
                size="md"
                py={5}
              >
                Users
              </Button>
            </>
          )}
          
          <Button
            leftIcon={<Heart size={18} />}
            onClick={() => navigate(`/donate`)}
            variant="ghost"
            borderRadius="md"
            _hover={{ bg: 'gray.100', color: 'gray.700' }}
            color="gray.500"
            justifyContent="flex-start"
            width="100%"
            size="md"
            py={5}
          >
            Donate
          </Button>
          <Button
            leftIcon={<BookOpen size={18} />}
            onClick={() => navigate(`/resources`)}
            variant="ghost"
            borderRadius="md"
            _hover={{ bg: 'gray.100', color: 'gray.700' }}
            color="gray.500"
            justifyContent="flex-start"
            width="100%"
            size="md"
            py={5}
          >
            Resources
          </Button>
        </VStack>
      )}

      {/* Profile and Logout */}
      {isDesktop && username && (
        <Box width="100%" mt="auto" pt={4} borderTop="1px" borderColor="gray.100">
          <Flex align="center" mb={3} p={2} borderRadius="md" _hover={{ bg: 'gray.50' }} 
                onClick={() => navigate(`/${username}/users`)} cursor="pointer">
            <Avatar 
              size="sm" 
              name={username} 
              src={profilePic} 
              mr={3}
            />
            <Text fontSize="sm" fontWeight="medium" color="gray.700" noOfLines={1}>
              {username}
            </Text>
          </Flex>
          <Button
            onClick={handleLogout}
            leftIcon={<LogOut size={18} />}
            variant="ghost"
            borderRadius="md"
            _hover={{ bg: 'gray.100', color: 'gray.700' }}
            color="gray.500"
            width="100%"
            size="md"
          >
            Logout
          </Button>
        </Box>
      )}

      {/* Register and Login Buttons */}
      {isDesktop && !username && (
        <Box width="100%" mt="auto">
          <VStack spacing={3} width="100%">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="md"
              width="100%"
              borderRadius="md"
              leftIcon={<LogIn size={16} />}
              _hover={{ bg: 'gray.100' }}
              _focus={{ boxShadow: 'none' }}
              color="gray.500"
              borderColor="gray.300"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/register')}
              bg="gray.500"
              color="white"
              variant="solid"
              size="md"
              width="100%"
              borderRadius="md"
              _hover={{ bg: 'gray.600' }}
              _focus={{ boxShadow: 'none' }}
            >
              Register
            </Button>
          </VStack>
        </Box>
      )}

      {/* Mobile View */}
      {!isDesktop && (
        <IconButton
          aria-label="Open Menu"
          variant="ghost"
          icon={<LogIn size={20} />}
          color="gray.500"
          _hover={{ bg: 'gray.100', color: 'gray.700' }}
        />
      )}
    </Box>
  );
};

export default Navbar;
