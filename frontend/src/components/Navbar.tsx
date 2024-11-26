import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  useMediaQuery,
  Image,
  Avatar,
} from '@chakra-ui/react';
import { Menu as MenuIcon, LogOut, LogIn } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';


const Navbar: React.FC = () => {
  const [isDesktop] = useMediaQuery('(min-width: 48em)');
  const navigate = useNavigate();
  const { username, setUsername } = useAuth();

  const handleLogout = () => {
    console.log('logout!');
    sessionStorage.clear();
    setUsername(null);
    navigate('/login');
  };

  return (
    <Box as="nav" bg="bg-surface" boxShadow="sm">
      <Flex align="center" justify="space-between" p={4}>
        {/* Left Section */}
        <HStack spacing={3}>
          <Button
            colorScheme="white"
            borderRadius="full"
            onClick={() => navigate('/')}
          >
            <Image src="vite.png" alt="username Icon" boxSize="65px" />
          </Button>

        </HStack>

        {/* Middle Section - Button Group, left-aligned */}
        {isDesktop && username && (
          <Flex flex="1" justify="flex-start" ml={10}>
            <ButtonGroup variant="unstyled" spacing={8}>
            <Button onClick={() => navigate(`/`)}>Home</Button>
              <Button onClick={() => navigate(`/${username}/feed`)}>Feed</Button>
              <Button onClick={() => navigate(`/${username}/chat`)}>Chat</Button>
              <Button onClick={() => navigate(`/${username}/groups`)}>Groups</Button>
              <Button onClick={() => navigate(`/${username}/fitness`)}>Fitness</Button>
            </ButtonGroup>
          </Flex>
        )}

        {/* Right Section - Profile and Logout */}
        {isDesktop && username && (
          <HStack ml="auto">
            <IconButton
              icon={
                <Avatar
                  size="md"
                  name={username}
                  src="https://bit.ly/dan-abramov"
                />
              }
              aria-label="Go to Profile"
              onClick={() => {
                console.log('Navigating to profile...');
                navigate(`/${username}/users`);
              }}
              variant="ghost"
              borderRadius="full"
              _hover={{ bg: 'transparent' }}
            />
            <IconButton
              icon={<LogOut />}
              aria-label="Logout"
              onClick={handleLogout}
              _focus={{ boxShadow: 'none' }} // Removes the focus outline
              variant="ghost"
            />
          </HStack>
        )}

        {/* Login Button */}
        {isDesktop && !username && (
          <Button
            ml="auto" // Push to the far right
            onClick={() => navigate('/login')}
            rightIcon={<LogIn />}
            variant="ghost"
          >
            Login
          </Button>
        )}

        {/* Mobile View */}
        {!isDesktop && (
          <IconButton
            aria-label="Open Menu"
            alignSelf="center"
            marginLeft="auto"
            marginRight="10px"
            variant="ghost"
            icon={<MenuIcon />}
          />
        )}
      </Flex>
    </Box>
  );
};

export default Navbar;
