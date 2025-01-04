import React, { useState, useEffect, useRef } from 'react';
import { animated, useSpring } from '@react-spring/web';
import {
  Box, Heading, Text, Button, VStack, HStack, Image, Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const AnimatedVStack = animated(VStack);
const AnimatedFlex = animated(Flex);

interface FeatureProps {
  title: string;
  description: string;
  imageSrc: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const [featuresInView, setFeaturesInView] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  const checkVisibility = (ref: React.RefObject<HTMLDivElement>, setInView: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top;
      const height = window.innerHeight;
      if (top <= height) { // Adjust this to trigger earlier if needed
        setInView(true);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (featuresRef.current) {
        checkVisibility(featuresRef, setFeaturesInView);
      }
      if (footerRef.current) {
        checkVisibility(footerRef, setFooterInView);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const featuresAnimation = useSpring({
    opacity: featuresInView ? 1 : 0,
    transform: featuresInView ? 'scale(1)' : 'scale(0.9)',
  });

  const footerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: {
      opacity: footerInView ? 1 : 0,
      transform: footerInView ? 'translateY(0)' : 'translateY(50px)',
    }
  });

  return (
    <Box className="flex flex-col items-center justify-center">
      <Box as="section" position="relative" height="100vh" width="100%" overflow="hidden">
        <Box as="img" src="veterans.jpg" alt="Veterans Society" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0
        }} />
        <Flex height="100%" align="center" justify="center" color="white" textAlign="center" direction="column" p={4} position="relative" zIndex="1">
          <Heading size="2xl" mb={4}>Welcome to Veterans Society</Heading>
          <Text fontSize="xl" mb={6}>Empowering veterans through resources, connections, and support.</Text>
          <Button colorScheme="whiteAlpha" size="lg" onClick={() => navigate('/register')}>Join Us Now</Button>
        </Flex>
      </Box>

      <AnimatedVStack ref={featuresRef} style={featuresAnimation} spacing={8} p={8} textAlign="center" bg="gray.50">
        <Heading size="xl">What We Offer</Heading>
        <HStack spacing={8} justify="center">
          <Feature title="Community Support" description="Connect with fellow veterans, share stories, and offer support to one another." imageSrc="community.jpg" />
          <Feature title="Resources" description="Access tools and resources to help you transition back to civilian life." imageSrc="resources.jpg" />
          <Feature title="Job Opportunities" description="Discover job opportunities and career support specifically for veterans." imageSrc="careers.jpg" />
        </HStack>
      </AnimatedVStack>

      <AnimatedFlex ref={footerRef} style={footerAnimation} align="center" justify="center" p={4} bg="gray.900" color="white" textAlign="center">
        <Text>© 2025 Veterans Society. All rights reserved.</Text>
      </AnimatedFlex>
    </Box>
  );
}

const Feature: React.FC<FeatureProps> = ({ title, description, imageSrc }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const featureAnimation = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'scale(1)' : 'scale(0.9)',
  });

  useEffect(() => {
    const checkFeatureVisibility = () => {
      if (ref.current) {
        const top = ref.current.getBoundingClientRect().top;
        const onScreen = top < window.innerHeight;
        if (onScreen) {
          setInView(true);
        }
      }
    };

    window.addEventListener('scroll', checkFeatureVisibility);
    checkFeatureVisibility();
    return () => window.removeEventListener('scroll', checkFeatureVisibility);
  }, []);

  return (
    <animated.div ref={ref} style={featureAnimation} className="v-stack flex flex-col items-center text-center">
    <Image
  src={imageSrc}
  alt={title}
  style={{
    width: '400px',  // Manually setting the width
    height: '200px', // Manually setting the height
    objectFit: 'cover', // Ensuring the aspect ratio is maintained without distortion
    display: 'block', // Making sure the image is a block to apply margin auto
    marginLeft: 'auto', // Auto margin for horizontal centering
    marginRight: 'auto', // Auto margin for horizontal centering
    marginBottom: '10px'
  }}
/>
    <Heading size="md">{title}</Heading>
    <Text style={{width: '380px'}}>{description}</Text>
  </animated.div>
  
  );
}

export default Home;
