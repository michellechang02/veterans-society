import { Center, Spinner } from '@chakra-ui/react';

export default function Loading() {
    return (
        <Center h="100vh">
            <Spinner size="xl" />
        </Center>
    );
} 