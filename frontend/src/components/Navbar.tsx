import {
    Box, Button, ButtonGroup, Flex, HStack, IconButton, Text, useBreakpointValue, Image
  } from '@chakra-ui/react';
  import { Menu } from 'react-feather';
  import { useNavigate } from 'react-router-dom';
  import React, { useState, useEffect } from 'react';
  
  const Navbar: React.FC = () => {
    const isDesktop = useBreakpointValue({
      base: true, sm: false, md: true, lg: true,
    });
    const navigate = useNavigate();
    const [user, setUser] = useState<string | null>('Michelle');
  
    const getUser = async () => {
      // Mocking the async call for now
      setUser('Michelle');
    };
  
    useEffect(() => {
      getUser();
    }, [navigate]);
  
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
              isRound={true}
              onClick={() => navigate('/')}
            >
              <Image src="vite.png" alt="User Icon" boxSize="65px" />
            </Button>
          </HStack>
  
          {/* Middle Section - Button Group, if user */}
          {isDesktop && user && (
            <ButtonGroup variant="unstyled" spacing={8} ml={10}>
              <Button onClick={() => navigate('/')}>Home</Button>
              <Button onClick={() => navigate('/groups')}>Groups</Button>
              <Button onClick={() => navigate('/chat')}>Chat</Button>
            </ButtonGroup>
          )}
  
          {/* Middle Section - Button Group, if not user */}
          {isDesktop && !user && (
            <ButtonGroup variant="unstyled" spacing={8} ml={10}>
              <Button onClick={() => navigate('/')}>Home</Button>
            </ButtonGroup>
          )}
  
          {/* Right Section - Logout Button */}
          {isDesktop && user && (
            <Button
              variant="outline"
              ml="auto"  // Push to the far right
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
  
          {isDesktop && !user && (
            <Button
              variant="outline"
              ml="auto"  // Push to the far right
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
  
          {/* Mobile View */}
          {!isDesktop && (
            <IconButton
              alignSelf="center"
              marginLeft="auto"
              marginRight="10px"
              variant="ghost"
              icon={<Menu />}
              aria-label="Open Menu"
            />
          )}
        </Flex>
      </Box>
    );
  }
  
  export default Navbar;
  