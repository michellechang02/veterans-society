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
        <>
            <Heading as="h2" size="lg" textAlign="center" mb={8} color="black" fontFamily="body" mt={8}>
                Donation
            </Heading>
            <Box
                shadow="lg"
                p={8}
                mx="auto"
                bgColor="white"
                maxW="600px"
                w="full"
            >
                <VStack spacing={8} align="center" w="full">
                    {informationForm == null && (
                        <form onSubmit={handleInformationSubmit} style={{width: '100%'}}>
                            <Stack spacing={6}>
                                <FormControl id="amount" isRequired>
                                    <FormLabel fontSize="lg">Donation Amount ($)</FormLabel>
                                    <Input name="amount" type="number" prefix="$" placeholder="1000" />
                                </FormControl>

                                <FormControl id="message">
                                    <FormLabel fontSize="lg">Donation Message</FormLabel>
                                    <Textarea name="message" placeholder="To those that serve our country..." />
                                </FormControl>

                                <Button
                                    bgColor="gray.500"
                                    color="white"
                                    size="lg"
                                    type="submit"
                                    width="full"
                                    fontSize="lg"
                                    fontWeight="bold"
                                >
                                    Continue
                                </Button>
                            </Stack>
                        </form>
                    )}
                    {informationForm != null && (
                        <Box w="full">
                            <IconButton icon={<BiArrowBack />} aria-label="Back" onClick={() => setInformationForm(null)} />
                            <Spacer h={8}/>
                            <form onSubmit={handlePaymentSubmit} style={{width: '100%'}}>
                                <Stack spacing={6}>
                                    <FormControl id="cardNumber" isRequired>
                                        <FormLabel fontSize="lg">Card Number</FormLabel>
                                        <Input name="cardNumber" type="text" placeholder="1234 5678 9012 3456" />
                                    </FormControl>

                                    <HStack spacing={6}>
                                        <FormControl id="expiryDate" isRequired>
                                            <FormLabel fontSize="lg">Expiry Date</FormLabel>
                                            <Input name="expiryDate" type="text" placeholder="MM/YY" pattern="(?:0[1-9]|1[0-2])/[0-9]{2}" />
                                        </FormControl>
                                        <FormControl id="securityCode" isRequired>
                                            <FormLabel fontSize="lg">Security Code</FormLabel>
                                            <Input name="securityCode" type="number" placeholder="XXX" />
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
                                    >
                                        Donate
                                    </Button>
                                </Stack>
                            </form>
                        </Box>
                    )}
                </VStack>
            </Box>
        </>
    );
};

Donate.displayName = 'Donate';

export default Donate;