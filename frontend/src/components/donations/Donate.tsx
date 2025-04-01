import React, { useState, useMemo } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    Heading,
    useToast,
    Text,
    Alert,
    AlertIcon,
    AlertDescription,
    Spinner,
    Divider,
    useColorModeValue,
} from '@chakra-ui/react';
import { PaymentElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import type { StripeElementsOptions } from '@stripe/stripe-js';

interface DonationResponse {
    id: string;
    amount: string;
    message?: string;
    donor_name?: string;
    email?: string;
    created_at: string;
    client_secret?: string;
}

type Props = object;

// Move this outside component and log to verify it's loading
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount }: { amount: string; onSuccess: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [ready, setReady] = useState(false);
    const toast = useToast();

    const buttonBg = useColorModeValue('gray.700', 'gray.600');
    const buttonHoverBg = useColorModeValue('black', 'gray.800');
    const spinnerColor = useColorModeValue('gray.500', 'gray.300');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/donation-success`,
                    payment_method_data: {
                        billing_details: {
                            // You can add billing details here if needed
                        }
                    }
                },
                redirect: 'always'
            });

            if (result.error) {
                throw result.error;
            }

        } catch (e: any) {
            console.error('Payment error:', e);
            setError(e.message || 'Payment failed');
            toast({
                title: "Payment Failed",
                description: e.message || "An error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={4} width="100%">
                {(!stripe || !elements) && (
                    <Box textAlign="center" py={4}>
                        <Spinner color={spinnerColor} />
                        <Text mt={2} color={spinnerColor}>Initializing payment system...</Text>
                    </Box>
                )}
                {(stripe && elements) && (
                    <>
                        <PaymentElement
                            id="payment-element"
                            onReady={() => {
                                setReady(true);
                            }}
                            options={{
                                layout: 'tabs',
                            }}
                        />
                        {error && (
                            <Alert status="error">
                                <AlertIcon />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            bg={buttonBg}
                            color="white"
                            width="full"
                            isLoading={processing}
                            disabled={!ready || processing}
                            _hover={{ bg: buttonHoverBg }}
                            transition="all 0.2s"
                        >
                            Pay ${amount}
                        </Button>
                    </>
                )}
            </VStack>
        </form>
    );
};

const Donate: React.FC<Props> = () => {
    const [amountInput, setAmountInput] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [donorName, setDonorName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [clientSecret, setClientSecret] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    // Define color mode values
    const pageBg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const headingColor = useColorModeValue('black', 'white');
    const textColor = useColorModeValue('gray.500', 'gray.300');
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const focusBorderColor = useColorModeValue('gray.500', 'gray.400');
    const buttonBg = useColorModeValue('gray.700', 'gray.600');
    const buttonHoverBg = useColorModeValue('black', 'gray.800');
    const amountTextColor = useColorModeValue('black', 'white');

    const handleInitialSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const formattedAmount = Number(amountInput).toFixed(2);

            const response = await axios.post<DonationResponse>(
                'http://127.0.0.1:8000/donations/create-payment-intent',
                {
                    amount: formattedAmount,
                    message,
                    donor_name: donorName || undefined,
                    email: email || undefined
                }
            );


            if (!response.data.client_secret) {
                throw new Error('No client secret received');
            }

            setClientSecret(response.data.client_secret);
        } catch (error: any) {
            console.error('Payment intent creation error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Could not initialize payment",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Create Stripe options only when clientSecret is available
    const options: StripeElementsOptions = useMemo(
        () => ({
            clientSecret,
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#0070f3',
                },
            },
        }),
        [clientSecret]
    );

    return (
        <Box 
            py={12} 
            px={4} 
            w="100%" 
            h="100vh" 
            bg={pageBg}
            overflow="auto"
        >
            <Box 
                maxW="600px" 
                mx="auto"
            >
                {!clientSecret ? (
                    <Box 
                        shadow="md"
                        p={6}
                        bgColor={cardBg}
                        borderRadius="md"
                        transition="all 0.2s"
                        _hover={{ shadow: "lg" }}
                    >
                        <VStack spacing={6} align="stretch">
                            <Heading size="md" mb={2} color={headingColor}>Make a Donation</Heading>
                            <Text color={textColor} mb={4}>Your support helps us continue our mission.</Text>
                            
                            <form onSubmit={handleInitialSubmit}>
                                <VStack spacing={6}>
                                    <FormControl isRequired>
                                        <FormLabel color={labelColor}>Amount ($)</FormLabel>
                                        <Input
                                            type="number"
                                            value={amountInput}
                                            onChange={(e) => {
                                                // Ensure valid decimal input
                                                const value = e.target.value;
                                                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                    setAmountInput(value);
                                                }
                                            }}
                                            min="0.01"
                                            step="0.01"
                                            placeholder="Enter amount"
                                            borderColor={borderColor}
                                            _focus={{ borderColor: focusBorderColor }}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel color={labelColor}>Name (Optional)</FormLabel>
                                        <Input
                                            value={donorName}
                                            onChange={(e) => setDonorName(e.target.value)}
                                            placeholder="Your name"
                                            borderColor={borderColor}
                                            _focus={{ borderColor: focusBorderColor }}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel color={labelColor}>Email (Optional)</FormLabel>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            borderColor={borderColor}
                                            _focus={{ borderColor: focusBorderColor }}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel color={labelColor}>Message (Optional)</FormLabel>
                                        <Textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Add a message..."
                                            borderColor={borderColor}
                                            _focus={{ borderColor: focusBorderColor }}
                                        />
                                    </FormControl>
                                    <Button
                                        type="submit"
                                        bg={buttonBg}
                                        color="white"
                                        width="full"
                                        isLoading={loading}
                                        isDisabled={!amountInput || parseFloat(amountInput) <= 0}
                                        _hover={{ bg: buttonHoverBg }}
                                        transition="all 0.2s"
                                    >
                                        Continue to Payment
                                    </Button>
                                </VStack>
                            </form>
                        </VStack>
                    </Box>
                ) : (
                    <Box 
                        shadow="md" 
                        p={6} 
                        borderRadius="md" 
                        bg={cardBg}
                        transition="all 0.2s"
                        _hover={{ shadow: "lg" }}
                    >
                        <VStack spacing={6} align="stretch">
                            <Heading size="md" color={headingColor}>Complete Your Donation</Heading>
                            <Text color={textColor} mb={2}>Thank you for your generosity</Text>
                            <Divider />
                            <Box py={2}>
                                <Text fontWeight="bold" fontSize="md" color={labelColor}>Amount</Text>
                                <Text fontSize="2xl" color={amountTextColor}>${amountInput}</Text>
                            </Box>
                            <Elements stripe={stripePromise} options={options}>
                                <CheckoutForm
                                    amount={amountInput}
                                    onSuccess={() => {
                                        toast({
                                            title: "Payment successful",
                                            description: "Thank you for your donation!",
                                            status: "success",
                                            duration: 5000,
                                            isClosable: true,
                                        });
                                    }}
                                />
                            </Elements>
                        </VStack>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

Donate.displayName = 'Donate';

export default Donate;