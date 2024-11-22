import {
    Box, Heading, Text, Button, VStack, HStack, Image, Flex
  } from '@chakra-ui/react';
  import { useNavigate } from 'react-router-dom';
  import React, { useEffect } from 'react';
  
  interface FeatureProps {
    title: string;
    description: string;
    imageSrc: string;
  }
  
  const Home: React.FC = () => {
    const navigate = useNavigate();
  
    useEffect(() => {
      console.log("home!!");
    }, []);
  
    return (
      <Box>
        {/* Hero Section */}
        <Box
  as="section"
  position="relative"
  height="100vh"
  width="100%"
  overflow="hidden"
>
  <Box
    as="img"
    src="veterans.jpg"
    alt="Veterans Society"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: 0,
    }}
  />

  <Flex
    height="100%"
    align="center"
    justify="center"
    color="white"
    textAlign="center"
    direction="column"
    p={4}
    position="relative"
    zIndex="1"
  >
    <Heading size="2xl" mb={4}>
      Welcome to Veterans Society
    </Heading>
    <Text fontSize="xl" mb={6}>
      Empowering veterans through resources, connections, and support.
    </Text>
    
    <Button colorScheme="whiteAlpha" size="lg" onClick={() => navigate('/register')}>
      Join Us Now
    </Button>
    {/* <Text fontSize="sm">US.gov</Text> */}
  </Flex>
</Box>


  
        {/* Features Section */}
        <VStack spacing={8} p={8} textAlign="center" bg="gray.50">
          <Heading size="xl">What We Offer</Heading>
          <HStack spacing={8} justify="center">
            <Feature
              title="Community Support"
              description="Connect with fellow veterans, share stories, and offer support to one another."
              imageSrc="community.jpg"
            />
            <Feature
              title="Resources"
              description="Access tools and resources to help you transition back to civilian life."
              imageSrc="resources.jpg"
            />
            <Feature
              title="Job Opportunities"
              description="Discover job opportunities and career support specifically for veterans."
              imageSrc="careers.jpg"
            />
          </HStack>
        </VStack>
  
        {/* Call to Action Section */}
        <Flex
          as="section"
          bgImage="footer.jpg"
          color="white"
          align="center"
          justify="center"
          direction="column"
          p={16}
          textAlign="center"
        >
          <Heading size="xl" mb={4}>
            Ready to Make a Difference?
          </Heading>
          <Button size="lg" colorScheme="whiteAlpha" onClick={() => navigate('/register')}>
            Sign Up Today
          </Button>
        </Flex>
  
        {/* Footer */}
        <Box as="footer" bg="gray.900" color="white" py={4} textAlign="center">
          <Text>© 2024 Veterans Society. All rights reserved.</Text>
        </Box>
      </Box>
    );
  }
  
  const Feature: React.FC<FeatureProps> = ({ title, description, imageSrc }) => {
    return (
      <VStack maxW="xs" textAlign="center">
        <Image boxSize="150px" src={imageSrc} alt={title} />
        <Heading size="md">{title}</Heading>
        <Text>{description}</Text>
      </VStack>
    );
  }
  
  export default Home;
  