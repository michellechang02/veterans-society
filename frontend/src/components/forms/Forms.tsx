import React from 'react';
import {
    Box,
    VStack,
    Heading,
    Text,
    Button,
    useToast,
    SimpleGrid,
    Card,
    CardHeader,
    CardFooter,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { getAllFormLinks } from '../../Api/getData';
import type { FormLink } from '../../Api/getData';

const Forms = () => {
    const [forms, setForms] = React.useState<FormLink[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const toast = useToast();

    React.useEffect(() => {
        const fetchForms = async () => {
            try {
                const links = await getAllFormLinks();
                setForms(links);  // Backend already returns the Items array
            } catch (error) {
                toast({
                    title: 'Error fetching forms',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, [toast]);

    const handleFormClick = async (link: string) => {
        if (!link) {
            console.error("Form link is undefined");
            return;
        }
        window.open(link, '_blank');
    };

    if (isLoading) {
        return <Box p={6}>Loading...</Box>;
    }

    return (
        <Box p={6} maxW="1200px" mx="auto">
            <VStack spacing={8} align="stretch">
                <Heading
                    as="h1"
                    size="xl"
                    textAlign="center"
                    color="gray.700"
                    mb={8}
                >
                    Forms & Surveys
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {forms.map((form) => (
                        <Card
                            key={form.link}
                            variant="outline"
                            borderRadius="lg"
                            boxShadow="md"
                            _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
                        >
                            <CardHeader>
                                <Heading size="md" color="gray.700">
                                    New veteran registration form
                                </Heading>
                            </CardHeader>
                            <CardFooter>
                                <Button
                                    rightIcon={<ExternalLinkIcon />}
                                    colorScheme="gray"
                                    variant="solid"
                                    onClick={() => handleFormClick(form.link)}
                                    width="full"
                                >
                                    Open Form
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </SimpleGrid>

                {forms.length === 0 && (
                    <Text textAlign="center" color="gray.500">
                        No forms available at this time.
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

export default Forms; 