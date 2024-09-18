import {
    Box, Button, ButtonGroup, Flex, HStack, IconButton, Text, useBreakpointValue,
  } from '@chakra-ui/react';
  import { Menu, User } from 'react-feather';
  import { useNavigate } from 'react-router-dom';
  import React, { useState, useEffect } from 'react';
  
  function Navbar() {
    const isDesktop = useBreakpointValue({
      base: true, sm: false, md: true, lg: true,
    });
    const navigate = useNavigate();
    const [user, setUser] = useState('Michelle');
  
    const getUser = async () => {
      // Mocking the async call for now
      setUser('Michelle');
    };
  
    // useEffect(() => {
    //   getUser();
    // }, [navigate]);
  
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
            <IconButton
              icon={<User />}
              colorScheme="teal"
              isRound={true}
              onClick={() => navigate('/')}
            />
            <Text fontWeight="bold">Veterans Society</Text>
          </HStack>
  
          {/* Middle Section - Button Group, if user */}
          {isDesktop && user && (
            <ButtonGroup variant="unstyled" spacing={8} ml={10}>
              <Button onClick={() => navigate('/')}>Home</Button>
              <Button onClick={() => navigate('/groups')}>Groups</Button>
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
              onClick={handleLogout}
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
  