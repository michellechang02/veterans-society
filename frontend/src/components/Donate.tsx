import React, { useEffect } from 'react';
import {
    Box,
    Button,
    Stack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    IconButton,
    Spacer,
    VStack,
    Heading,
    useToast,
    Text,
} from '@chakra-ui/react';
import { BiArrowBack } from 'react-icons/bi';
import { loadStripe } from '@stripe/stripe-js';
import {
    CardElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51R5nRm9Nhg1yWMx5UzCXkURTQ8Pg5h1p00cSFMdo4UeWyIr0Kj3gi70g6CbNdPX9UuKk45haHqYZZ7W6jh6ZAKXH00BUXf44dL');

type DonationInformationForm = {
    amount: number;
    message: string;
    donor_name?: string;
    email?: string;
};

interface PaymentFormProps {
    informationForm: DonationInformationForm;
    onBack: () => void;
    onSuccess: () => void;
}

// Payment form component that uses Stripe Elements
const PaymentForm = ({ informationForm, onBack, onSuccess }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const toast = useToast();
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [clientSecret, setClientSecret] = React.useState('');

    // Get a payment intent from the server when the component mounts
    useEffect(() => {
        const createIntent = async () => {
            try {
                setIsProcessing(true);
                const response = await axios.post('http://127.0.0.1:8000/donations/create-payment-intent', {
                    amount: informationForm.amount,
                    message: informationForm.message,
                    donor_name: informationForm.donor_name || null,
                    email: informationForm.email || null
                });
                
                setClientSecret(response.data.client_secret);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Could not initialize payment. Please try again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                console.error("Payment intent error:", error);
            } finally {
                setIsProcessing(false);
            }
        };

        if (informationForm) {
            createIntent();
        }
    }, [informationForm, toast]);

    const handlePaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet
            return;
        }

        setIsProcessing(true);

        try {
            const cardElement = elements.getElement(CardElement);
            
            if (!cardElement) {
                throw new Error("Card element not found");
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (error) {
                toast({
                    title: "Payment Failed",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } else if (paymentIntent.status === 'succeeded') {
                toast({
                    title: "Donation Successful",
                    description: `Thank you for your donation of $${informationForm.amount}`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                onSuccess();
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box w="full">
            <IconButton 
                icon={<BiArrowBack />} 
                aria-label="Back" 
                onClick={onBack}
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
                    
                    <FormControl id="card-element" isRequired>
                        <FormLabel fontSize="lg" fontWeight="medium">Card Details</FormLabel>
                        <Box 
                            p={4} 
                            borderWidth="1px" 
                            borderColor="gray.300" 
                            borderRadius="md"
                            _hover={{ borderColor: "gray.400" }}
                        >
                            <CardElement 
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#424770',
                                            '::placeholder': {
                                                color: '#aab7c4',
                                            },
                                        },
                                        invalid: {
                                            color: '#9e2146',
                                        },
                                    },
                                }}
                            />
                        </Box>
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
                        isLoading={isProcessing}
                        loadingText="Processing"
                        disabled={!stripe || isProcessing || !clientSecret}
                    >
                        Complete Donation
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};

const Donate: React.FC = () => {
    const [informationForm, setInformationForm] = React.useState<DonationInformationForm | null>(null);
    const [isComplete, setIsComplete] = React.useState(false);
    const toast = useToast();

    const handleInformationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const amount = Number(formData.get('amount'));
        const message = formData.get('message') as string;
        const donor_name = formData.get('donor_name') as string;
        const email = formData.get('email') as string;

        if (!amount || amount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid donation amount greater than 0.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setInformationForm({ amount, message, donor_name, email });
    };

    const handleSuccess = () => {
        setIsComplete(true);
        // Could redirect to a thank you page or reset the form
    };

    if (isComplete) {
        return (
            <Box py={12} px={4} bg="gray.50" minH="100vh">
                <VStack spacing={8}>
                    <Heading as="h2" size="xl">Thank You!</Heading>
                    <Text fontSize="lg">Your donation has been processed successfully.</Text>
                    <Button 
                        onClick={() => {
                            setInformationForm(null);
                            setIsComplete(false);
                        }}
                        colorScheme="gray"
                    >
                        Make Another Donation
                    </Button>
                </VStack>
            </Box>
        );
    }

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
                                        min="1"
                                        step="1"
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
                                
                                <FormControl id="donor_name">
                                    <FormLabel fontSize="lg" fontWeight="medium">Your Name (Optional)</FormLabel>
                                    <Input 
                                        name="donor_name" 
                                        type="text" 
                                        placeholder="John Doe" 
                                        size="lg"
                                        borderColor="gray.300"
                                        _hover={{ borderColor: "gray.400" }}
                                        focusBorderColor="gray.500"
                                    />
                                </FormControl>
                                
                                <FormControl id="email">
                                    <FormLabel fontSize="lg" fontWeight="medium">Email (Optional)</FormLabel>
                                    <Input 
                                        name="email" 
                                        type="email" 
                                        placeholder="your@email.com" 
                                        size="lg"
                                        borderColor="gray.300"
                                        _hover={{ borderColor: "gray.400" }}
                                        focusBorderColor="gray.500"
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
                        <Elements stripe={stripePromise}>
                            <PaymentForm 
                                informationForm={informationForm} 
                                onBack={() => setInformationForm(null)}
                                onSuccess={handleSuccess}
                            />
                        </Elements>
                    )}
                </VStack>
            </Box>
        </Box>
    );
};

Donate.displayName = 'Donate';

export default Donate;