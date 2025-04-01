import { Box, VStack, useMediaQuery, Image, Avatar, Button, IconButton, Flex, Text, Badge, useToast, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';
import { useEffect, useState } from 'react';
import { getUserProfilePic, getUserData } from '../Api/getData';
import { LogOut, LogIn, Home, Users, MessageCircle, Grid, Activity, Search, CreditCard, BookOpen, Settings, File } from 'react-feather';
import ColorModeToggle from './ColorModeToggle';

const Navbar: React.FC = () => {
  const [isDesktop] = useMediaQuery('(min-width: 50em)');
  const navigate = useNavigate();
  const { username, logout, profileVersion } = useAuth();
  const [profilePic, setProfilePic] = useState<string>('');
  const [isVeteran, setIsVeteran] = useState<boolean>(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const hoverTextColor = useColorModeValue('gray.700', 'white');
  const buttonColor = useColorModeValue('gray.500', 'gray.400');
  const profileHoverBg = useColorModeValue('gray.50', 'gray.700');

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
  }, [username, profileVersion]);

  useEffect(() => {
    if (username) {
      getUserData({
        username,
        setUserData: (data) => {
          setIsVeteran(data.isVeteran);
        },
        toast,
        checkAdmin: true
      });
    }
  }, [username, toast]);

  return (
    <Box
      as="nav"
      bg={bgColor}
      boxShadow="lg"
      width="200px"
      height="100vh"
      position="fixed"
      left={0}
      top={0}
      py={4}
      px={3}
      borderRight="1px"
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
    >
      {/* Logo Section */}
      <Flex
        align="center"
        mb={6}
        p={3}
        borderRadius="md"
        bgColor={useColorModeValue('gray.50', 'gray.700')}
        boxShadow="sm"
        border="1px"
        borderColor={borderColor}
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
          color={textColor}
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
            _hover={{ bg: hoverBgColor, color: hoverTextColor }}
            color={buttonColor}
            justifyContent="flex-start"
            width="100%"
            size="md"
            py={5}
          >
            Main Page
          </Button>

          {username && (
            <>
              <Button
                leftIcon={<Grid size={18} />}
                onClick={() => navigate(`/${username}/feed`)}
                variant="ghost"
                borderRadius="md"
                _hover={{ bg: hoverBgColor, color: hoverTextColor }}
                color={buttonColor}
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
                _hover={{ bg: hoverBgColor, color: hoverTextColor }}
                color={buttonColor}
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
                _hover={{ bg: hoverBgColor, color: hoverTextColor }}
                color={buttonColor}
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
                _hover={{ bg: hoverBgColor, color: hoverTextColor }}
                color={buttonColor}
                justifyContent="flex-start"
                width="100%"
                size="md"
                py={5}
              >
                Tasks
              </Button>
              <Button
                leftIcon={<Search size={18} />}
                onClick={() => navigate(`/${username}/search`)}
                variant="ghost"
                borderRadius="md"
                _hover={{ bg: hoverBgColor, color: hoverTextColor }}
                color={buttonColor}
                justifyContent="flex-start"
                width="100%"
                size="md"
                py={5}
              >
                Users
              </Button>
              {/* Admin Dashboard Button - Only shown for non-veterans (admins) */}
              {!isVeteran && (
                <Button
                  leftIcon={<Settings size={18} />}
                  onClick={() => navigate(`/${username}/dashboard`)}
                  variant="ghost"
                  borderRadius="md"
                  _hover={{ bg: hoverBgColor, color: hoverTextColor }}
                  color={buttonColor}
                  justifyContent="flex-start"
                  width="100%"
                  size="md"
                  py={5}
                >
                  Dashboard
                </Button>
              )}
            </>
          )}

          <Button
            leftIcon={<CreditCard size={18} />}
            onClick={() => navigate(`/donate`)}
            variant="ghost"
            borderRadius="md"
            _hover={{ bg: hoverBgColor, color: hoverTextColor }}
            color={buttonColor}
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
            _hover={{ bg: hoverBgColor, color: hoverTextColor }}
            color={buttonColor}
            justifyContent="flex-start"
            width="100%"
            size="md"
            py={5}
          >
            Resources
          </Button>
          {(
              <Button
                leftIcon={<File size={18} />}
                variant="ghost"
                onClick={() => navigate(`/${username}/forms`)}
                borderRadius="md"
                _hover={{ bg: hoverBgColor, color: hoverTextColor }}
                color={buttonColor}
                justifyContent="flex-start"
                width="100%"
                size="md"
                py={5}
              >
                Forms
              </Button>
          )}
        </VStack>
      )}

      {/* Profile and Logout */}
      {isDesktop && username && (
        <Box width="100%" mt="auto" pt={4} borderTop="1px" borderColor={borderColor}>
          
          <Flex align="center" mb={3} p={2} borderRadius="md" _hover={{ bg: profileHoverBg }}
            onClick={() => navigate(`/${username}/users`)} cursor="pointer">
            <Avatar
              size="sm"
              name={username}
              src={profilePic}
              mr={3}
            />
            <Flex direction="column">
              <Text fontSize="sm" fontWeight="medium" color={textColor} noOfLines={1}>
                {username}
              </Text>
              <Badge
                bg={isVeteran ? "gray.700" : "black"}
                color="white"
                fontSize="2xs"
                variant="solid"
                borderRadius="full"
                px={1.5}
                py={0.5}
                minW="auto"
                maxW="fit-content"
                boxShadow="0 1px 2px rgba(0,0,0,0.1)"
                fontWeight="medium"
              >
                {isVeteran ? "veteran" : "admin"}
              </Badge>
            </Flex>
          </Flex>
          <Button
            onClick={handleLogout}
            leftIcon={<LogOut size={18} />}
            variant="ghost"
            borderRadius="md"
            _hover={{ bg: hoverBgColor, color: hoverTextColor }}
            color={subTextColor}
            width="100%"
            size="md"
          >
            Logout
          </Button>
          <Box mt={2} display="flex" justifyContent="center">
              <ColorModeToggle />
            </Box>
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
              _hover={{ bg: hoverBgColor }}
              _focus={{ boxShadow: 'none' }}
              color={buttonColor}
              borderColor={borderColor}
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/register')}
              bg={useColorModeValue('gray.500', 'gray.600')}
              color="white"
              variant="solid"
              size="md"
              width="100%"
              borderRadius="md"
              _hover={{ bg: useColorModeValue('gray.600', 'gray.500') }}
              _focus={{ boxShadow: 'none' }}
            >
              Register
            </Button>
            <Box mt={2} display="flex" justifyContent="center">
              <ColorModeToggle />
            </Box>
          </VStack>
        </Box>
      )}

      {/* Mobile View */}
      {!isDesktop && (
        <IconButton
          aria-label="Open Menu"
          variant="ghost"
          icon={<LogIn size={20} />}
          color={buttonColor}
          _hover={{ bg: hoverBgColor, color: hoverTextColor }}
        />
      )}

      
    </Box>
  );
};

export default Navbar;
