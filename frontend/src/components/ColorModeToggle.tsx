import React from 'react';
import { Button, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { Sun, Moon } from 'react-feather';

const ColorModeToggle: React.FC = () => {
  const { toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(Moon, Sun);
  const bgColor = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.500', 'gray.400');

  return (
    <Button
      leftIcon={<SwitchIcon size={18} />}
      onClick={toggleColorMode}
      variant="ghost"
      borderRadius="md"
      color={color}
      bg={bgColor}
      _hover={{ 
        bg: useColorModeValue('gray.100', 'gray.700'),
        color: useColorModeValue('gray.700', 'white')
      }}
      width="100%"
      size="md"
      justifyContent="flex-start"
    >
      {useColorModeValue('Dark Mode', 'Light Mode')}
    </Button>
  );
};

export default ColorModeToggle; 