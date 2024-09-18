import { Box, Heading, Text, Button, VStack, HStack, Image, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Flex
        as="section"
        height="100vh"
        align="center"
        justify="center"
        bg="teal.500"
        color="white"
        textAlign="center"
        direction="column"
        p={4}
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
      </Flex>

      {/* Features Section */}
      <VStack spacing={8} p={8} textAlign="center" bg="gray.50">
        <Heading size="xl">What We Offer</Heading>
        <HStack spacing={8} justify="center">
          <Feature
            title="Community Support"
            description="Connect with fellow veterans, share stories, and offer support to one another."
            imageSrc="https://via.placeholder.com/150"
          />
          <Feature
            title="Resources"
            description="Access tools and resources to help you transition back to civilian life."
            imageSrc="https://via.placeholder.com/150"
          />
          <Feature
            title="Job Opportunities"
            description="Discover job opportunities and career support specifically for veterans."
            imageSrc="https://via.placeholder.com/150"
          />
        </HStack>
      </VStack>

      {/* Call to Action Section */}
      <Flex
        as="section"
        bg="teal.500"
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

function Feature({ title, description, imageSrc }) {
  return (
    <VStack maxW="xs" textAlign="center">
      <Image boxSize="150px" src={imageSrc} alt={title} />
      <Heading size="md">{title}</Heading>
      <Text>{description}</Text>
    </VStack>
  );
}

export default Home;
