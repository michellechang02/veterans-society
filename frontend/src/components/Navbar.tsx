import {
  Box, Button, ButtonGroup, Flex, HStack, IconButton,
  useMediaQuery, Image, Avatar
} from '@chakra-ui/react';
import { Menu as MenuIcon, LogOut } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [isDesktop] = useMediaQuery('(min-width: 48em)');
  const navigate = useNavigate();
  const [user, setUser] = useState<string | null>('Michelle');

  const handleLogout = () => {
    console.log("logout!");
    localStorage.clear();
    setUser(null);
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
            <Image src="vite.png" alt="User Icon" boxSize="65px" />
          </Button>
        </HStack>

        {/* Middle Section - Button Group, left-aligned */}
        {isDesktop && user && (
          <Flex flex="1" justify="flex-start" ml={10}>
            <ButtonGroup variant="unstyled" spacing={8}>
              <Button onClick={() => navigate('/')}>Home</Button>
              <Button onClick={() => navigate('/groups')}>Groups</Button>
              <Button onClick={() => navigate('/chat')}>Chat</Button>
            </ButtonGroup>
          </Flex>
        )}

        {/* Right Section - Profile and Logout */}
        {isDesktop && user && (
          <HStack ml="auto">
            <IconButton
              icon={<Avatar size="md" name="Michelle Chang" src="https://bit.ly/dan-abramov" />}
              aria-label="Go to Profile"
              onClick={() => {
                console.log('Navigating to profile...');
                navigate('/profile');
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

        {isDesktop && !user && (
          <Button
            variant="outline"
            ml="auto" // Push to the far right
            onClick={() => navigate('/login')}
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
