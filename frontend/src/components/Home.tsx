import React from 'react';
import {
  Box, Heading, Text, Button, VStack, HStack, Image, Flex, useColorModeValue
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';

interface FeatureProps {
  title: string;
  description: string;
  imageSrc: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useAuth();
  
  // Add color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.700', 'white');
  const buttonBgColor = useColorModeValue('gray.500', 'gray.500');
  const buttonHoverBg = useColorModeValue('gray.600', 'gray.700');
  const footerBgColor = useColorModeValue('gray.500', 'gray.700');
  
  return (
    <Box className="flex flex-col items-center justify-center">
      <Box as="section" position="relative" height="100vh" width="100%" overflow="hidden">
        <Box as="img" src="veterans.jpg" alt="Veterans Society" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0,
          filter: useColorModeValue('none', 'brightness(0.7)')
        }} />
        <Flex height="100%" align="center" justify="center" color="white" textAlign="center" direction="column" p={4} position="relative" zIndex="1">
          <Heading size="2xl" mb={4}>Welcome to Veterans Society</Heading>
          <Text fontSize="xl" mb={6}>Empowering veterans through resources, connections, and support.</Text>
          {username ? 
            <Button bgColor={buttonBgColor} color="white" size="lg" onClick={() => navigate(`/${username}/feed`)}
              _hover={{ bg: buttonHoverBg }} shadow="md">
              Visit Feed
            </Button>
          : 
            <Button bgColor={buttonBgColor} color="white" size="lg" onClick={() => navigate('/register')}
              _hover={{ bg: buttonHoverBg }} shadow="md">
              Join Us Now
            </Button>
          }
        </Flex>
      </Box>

      <VStack spacing={8} p={8} textAlign="center" mx={{base: 4, md: 20}} bgColor={bgColor} shadow="md" my={8}>
        <Heading size="xl" color={headingColor}>What We Offer</Heading>
        <HStack spacing={{base: 4, md: 8}} justify="center" flexWrap={{base: "wrap", md: "nowrap"}}>
          <Feature title="Community Support" description="Connect with fellow veterans, share stories, and offer support to one another." imageSrc="community.jpg" />
          <Feature title="Resources" description="Access tools and resources to help you transition back to civilian life." imageSrc="resources.jpg" />
          <Feature title="Job Opportunities" description="Discover job opportunities and career support specifically for veterans." imageSrc="careers.jpg" />
        </HStack>
      </VStack>

      <Flex align="center" justify="center" p={4} bg={footerBgColor} color="white" textAlign="center" w="100%">
        <Text>© 2025 Veterans Society. All rights reserved.</Text>
      </Flex>
    </Box>
  );
}

const Feature: React.FC<FeatureProps> = ({ title, description, imageSrc }) => {
  // Add color mode values for the Feature component
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const boxBgColor = useColorModeValue('transparent', 'gray.700');
  
  return (
    <Box className="flex flex-col items-center text-center" 
      p={4} 
      borderRadius="md" 
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-5px)', shadow: 'md' }}
      maxW="350px"
      bg={boxBgColor}
    >
      <Image
        src={imageSrc}
        alt={title}
        borderRadius="md"
        shadow="sm"
        width="300px"
        height="200px"
        objectFit="cover"
        mb={4}
      />
      <Heading size="md" color={headingColor} mb={2}>{title}</Heading>
      <Text color={textColor}>{description}</Text>
    </Box>
  );
}

export default Home;
