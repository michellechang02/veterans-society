import React from 'react';
import {
    Box,
    Heading,
    Text,
    Button,
    useToast,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useColorModeValue,
} from '@chakra-ui/react';
import { ExternalLink } from 'react-feather';
import { getAllFormLinks } from '../../Api/getData';
import type { FormLink } from '../../Api/getData';

const Forms = () => {
    const [forms, setForms] = React.useState<FormLink[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const toast = useToast();

    // Color mode values
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const headingColor = useColorModeValue('gray.700', 'white');
    const textColor = useColorModeValue('gray.700', 'gray.300');
    const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
    const cardHeaderBg = useColorModeValue('gray.700', 'gray.600');
    const cardFooterBg = useColorModeValue('gray.50', 'gray.700');
    const buttonBg = useColorModeValue('gray.600', 'blue.500');
    const buttonHoverBg = useColorModeValue('gray.700', 'blue.600');
    const accentColor = useColorModeValue('gray.500', 'blue.400');
    
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
        return (
            <Box p={6} minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
                <Text fontSize="lg" color={mutedTextColor}>Loading...</Text>
            </Box>
        );
    }

    return (
        <Box 
            h="100vh" 
            w="100%" 
            p={6} 
            bg={bgColor}
            overflowY="auto"
        >
            <Box maxW="1200px" mx="auto">
                <Heading 
                    as="h2" 
                    size="xl" 
                    textAlign="center" 
                    mb={8} 
                    color={headingColor}
                    fontFamily="heading"
                    letterSpacing="tight"
                    position="relative"
                    _after={{
                        content: '""',
                        display: 'block',
                        width: '80px',
                        height: '4px',
                        bgColor: accentColor,
                        mx: 'auto',
                        mt: 2,
                        borderRadius: 'full'
                    }}
                >
                    Forms & Surveys
                </Heading>

                {forms.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mx={8}>
                        {forms.map((form) => (
                            <Card
                                key={form.link}
                                shadow="lg"
                                borderRadius="lg"
                                overflow="hidden"
                                bg={cardBg}
                                height="100%"
                                display="flex"
                                flexDirection="column"
                            >
                                <CardHeader bg={cardHeaderBg} py={4}>
                                    <Heading size="md" color="white" fontWeight="semibold">
                                        New Veteran Registration Form
                                    </Heading>
                                </CardHeader>
                                <CardBody py={4} flex="1">
                                    <Text color={textColor} fontSize="sm">
                                        Fill out this form to register as a new veteran in our system.
                                    </Text>
                                </CardBody>
                                <CardFooter bg={cardFooterBg} py={4}>
                                    <Button
                                        rightIcon={<ExternalLink size={18} />}
                                        bg={buttonBg}
                                        color="white"
                                        _hover={{ bg: buttonHoverBg }}
                                        onClick={() => handleFormClick(form.link)}
                                        width="full"
                                        borderRadius="md"
                                    >
                                        Open Form
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </SimpleGrid>
                ) : (
                    <Box
                        shadow="lg"
                        p={6}
                        bgColor={cardBg}
                        borderRadius="lg"
                        mx={8}
                        textAlign="center"
                        height="200px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="column"
                    >
                        <Text fontSize="lg" color={mutedTextColor} fontWeight="medium" mb={4}>
                            No forms available at this time.
                        </Text>
                        <Text color={mutedTextColor} fontSize="md">
                            Please check back later for registration forms.
                        </Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Forms; 