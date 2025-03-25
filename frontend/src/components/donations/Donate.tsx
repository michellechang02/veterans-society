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
                        <Spinner />
                        <Text mt={2}>Initializing payment system...</Text>
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
                            colorScheme="blue"
                            width="full"
                            isLoading={processing}
                            disabled={!ready || processing}
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
        <Box py={12} px={4} maxW="600px" mx="auto">
            {!clientSecret ? (
                <form onSubmit={handleInitialSubmit}>
                    <VStack spacing={6}>
                        <FormControl isRequired>
                            <FormLabel>Amount ($)</FormLabel>
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
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Name (Optional)</FormLabel>
                            <Input
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                placeholder="Your name"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Email (Optional)</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Message (Optional)</FormLabel>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Add a message..."
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            colorScheme="blue"
                            width="full"
                            isLoading={loading}
                            isDisabled={!amountInput || parseFloat(amountInput) <= 0}
                        >
                            Continue to Payment
                        </Button>
                    </VStack>
                </form>
            ) : (
                <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
                    <VStack spacing={4}>
                        <Heading size="md">Complete Your Donation</Heading>
                        <Text>Amount: ${amountInput}</Text>
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
    );
};

Donate.displayName = 'Donate';

export default Donate;