import React from 'react';
import {
    Box,
    Button,
    Stack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    HStack,
    IconButton,
    Spacer,
    VStack,
    Heading,
    useToast,
    Text,
} from '@chakra-ui/react';
import { BiArrowBack } from 'react-icons/bi';

type DonationInformationForm = {
    amount: number;
    message: string;
};
type DonationPaymentForm = {
    cardNumber: string;
    expiryDate: string;
    securityCode: number;
};

type Props = object;

const Donate: React.FC<Props> = () => {
    const [informationForm, setInformationForm] = React.useState<DonationInformationForm | null>(null);
    const [paymentForm, setPaymentForm] = React.useState<DonationPaymentForm | null>(null);
    const toast = useToast();

    const handleInformationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const amount = Number(formData.get('amount'));
        const message = formData.get('message') as string;

        setInformationForm({ amount, message });
    };
    const handlePaymentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const cardNumber = formData.get('cardNumber') as string;
        const expiryDate = formData.get('expiryDate') as string;
        const securityCode = Number(formData.get('securityCode'));

        setPaymentForm({ cardNumber, expiryDate, securityCode });
        toast({
            title: "Donation successful",
            description: `Thank you for your donation of $${informationForm?.amount}`,
            status: "success",
            duration: 5000,
            isClosable: true,
        });
        console.log(cardNumber, expiryDate, securityCode);
        console.log(paymentForm);
    };

    return (
        <Box py={12} px={4} bg="gray.50" minH="100vh">
            <Heading 
                as="h2" 
                size="xl" 
                textAlign="center" 
                mb={10} 
                color="black" 
                fontFamily="body"
                fontWeight="bold"
            >
                Make a Donation
            </Heading>
            <Box
                shadow="xl"
                p={8}
                mx="auto"
                bgColor="white"
                maxW="600px"
                w="full"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
                transition="all 0.3s"
            >
                <VStack spacing={8} align="center" w="full">
                    {informationForm == null && (
                        <form onSubmit={handleInformationSubmit} style={{width: '100%'}}>
                            <Stack spacing={6}>
                                <FormControl id="amount" isRequired>
                                    <FormLabel fontSize="lg" fontWeight="medium">Donation Amount ($)</FormLabel>
                                    <Input 
                                        name="amount" 
                                        type="number" 
                                        placeholder="1000" 
                                        size="lg"
                                        borderColor="gray.300"
                                        _hover={{ borderColor: "gray.400" }}
                                        focusBorderColor="gray.500"
                                    />
                                </FormControl>

                                <FormControl id="message">
                                    <FormLabel fontSize="lg" fontWeight="medium">Donation Message</FormLabel>
                                    <Textarea 
                                        name="message" 
                                        placeholder="To those that serve our country..." 
                                        size="lg"
                                        borderColor="gray.300"
                                        _hover={{ borderColor: "gray.400" }}
                                        focusBorderColor="gray.500"
                                        resize="vertical"
                                        minHeight="120px"
                                    />
                                </FormControl>

                                <Button
                                    bgColor="gray.500"
                                    color="white"
                                    size="lg"
                                    type="submit"
                                    width="full"
                                    fontSize="lg"
                                    fontWeight="bold"
                                    mt={4}
                                    py={6}
                                    _hover={{ bgColor: "gray.600" }}
                                    _active={{ bgColor: "gray.700" }}
                                    transition="all 0.2s"
                                >
                                    Continue
                                </Button>
                            </Stack>
                        </form>
                    )}
                    {informationForm != null && (
                        <Box w="full">
                            <IconButton 
                                icon={<BiArrowBack />} 
                                aria-label="Back" 
                                onClick={() => setInformationForm(null)}
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.500"
                                _hover={{ bgColor: "gray.50" }}
                            />
                            <Spacer h={8}/>
                            <form onSubmit={handlePaymentSubmit} style={{width: '100%'}}>
                                <Stack spacing={6}>
                                    <Box 
                                        p={4} 
                                        bg="gray.50" 
                                        borderRadius="md" 
                                        borderWidth="1px" 
                                        borderColor="gray.200"
                                        mb={4}
                                    >
                                        <Text fontSize="sm" color="gray.500" fontWeight="medium">Donation Amount</Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="black">${informationForm.amount}</Text>
                                    </Box>
                                    
                                    <FormControl id="cardNumber" isRequired>
                                        <FormLabel fontSize="lg" fontWeight="medium">Card Number</FormLabel>
                                        <Input 
                                            name="cardNumber" 
                                            type="text" 
                                            placeholder="1234 5678 9012 3456" 
                                            size="lg"
                                            borderColor="gray.300"
                                            _hover={{ borderColor: "gray.400" }}
                                            focusBorderColor="gray.500"
                                        />
                                    </FormControl>

                                    <HStack spacing={6}>
                                        <FormControl id="expiryDate" isRequired>
                                            <FormLabel fontSize="lg" fontWeight="medium">Expiry Date</FormLabel>
                                            <Input 
                                                name="expiryDate" 
                                                type="text" 
                                                placeholder="MM/YY" 
                                                pattern="(?:0[1-9]|1[0-2])/[0-9]{2}"
                                                size="lg"
                                                borderColor="gray.300"
                                                _hover={{ borderColor: "gray.400" }}
                                                focusBorderColor="gray.500"
                                            />
                                        </FormControl>
                                        <FormControl id="securityCode" isRequired>
                                            <FormLabel fontSize="lg" fontWeight="medium">Security Code</FormLabel>
                                            <Input 
                                                name="securityCode" 
                                                type="number" 
                                                placeholder="XXX"
                                                size="lg"
                                                borderColor="gray.300"
                                                _hover={{ borderColor: "gray.400" }}
                                                focusBorderColor="gray.500"
                                            />
                                        </FormControl>
                                    </HStack>

                                    <Button
                                        bgColor="gray.500"
                                        color="white"
                                        size="lg"
                                        type="submit"
                                        width="full"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        mt={4}
                                        py={6}
                                        _hover={{ bgColor: "gray.600" }}
                                        _active={{ bgColor: "gray.700" }}
                                        transition="all 0.2s"
                                    >
                                        Complete Donation
                                    </Button>
                                </Stack>
                            </form>
                        </Box>
                    )}
                </VStack>
            </Box>
        </Box>
    );
};

Donate.displayName = 'Donate';

export default Donate;