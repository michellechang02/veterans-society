import { Center, Spinner, useColorModeValue } from '@chakra-ui/react';

export default function Loading() {
    const bgColor = useColorModeValue('white', 'gray.800');
    const spinnerColor = useColorModeValue('gray.500', 'gray.400');
    
    return (
        <Center h="100vh" bg={bgColor}>
            <Spinner 
                size="xl" 
                color={spinnerColor}
                thickness="4px"
                speed="0.65s"
            />
        </Center>
    );
} 