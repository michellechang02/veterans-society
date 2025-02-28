import React from 'react';
import {
  Box, Heading, Text, Button, VStack, HStack, Image, Flex
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
  return (
    <Box className="flex flex-col items-center justify-center">
      <Box as="section" position="relative" height="100vh" width="100%" overflow="hidden">
        <Box as="img" src="veterans.jpg" alt="Veterans Society" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0
        }} />
        <Flex height="100%" align="center" justify="center" color="white" textAlign="center" direction="column" p={4} position="relative" zIndex="1">
          <Heading size="2xl" mb={4}>Welcome to Veterans Society</Heading>
          <Text fontSize="xl" mb={6}>Empowering veterans through resources, connections, and support.</Text>
          {username ? <Button colorScheme="whiteAlpha" size="lg" onClick={() => navigate(`/${username}/feed`)}>Visit Feed</Button>
          : <Button colorScheme="whiteAlpha" size="lg" onClick={() => navigate('/register')}>Join Us Now</Button>}
        </Flex>
      </Box>

      <VStack spacing={8} p={8} textAlign="center" mx={20}>
        <Heading size="xl">What We Offer</Heading>
        <HStack spacing={8} justify="center">
          <Feature title="Community Support" description="Connect with fellow veterans, share stories, and offer support to one another." imageSrc="community.jpg" />
          <Feature title="Resources" description="Access tools and resources to help you transition back to civilian life." imageSrc="resources.jpg" />
          <Feature title="Job Opportunities" description="Discover job opportunities and career support specifically for veterans." imageSrc="careers.jpg" />
        </HStack>
      </VStack>

      <Flex align="center" justify="center" p={4} bg="gray.900" color="white" textAlign="center">
        <Text>© 2025 Veterans Society. All rights reserved.</Text>
      </Flex>
    </Box>
  );
}

const Feature: React.FC<FeatureProps> = ({ title, description, imageSrc }) => {
  return (
    <div className="v-stack flex flex-col items-center text-center">
      <Image
        src={imageSrc}
        alt={title}
        style={{
          width: '300px',  // Manually setting the width
          height: '200px', // Manually setting the height
          objectFit: 'cover', // Ensuring the aspect ratio is maintained without distortion
          display: 'block', // Making sure the image is a block to apply margin auto
          marginLeft: 'auto', // Auto margin for horizontal centering
          marginRight: 'auto', // Auto margin for horizontal centering
          marginBottom: '10px'
        }}
      />
      <Heading size="md">{title}</Heading>
      <Text style={{width: '350px'}}>{description}</Text>
    </div>
  );
}

export default Home;
