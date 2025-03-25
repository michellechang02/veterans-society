import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStripe, Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
    Box,
    VStack,
    Heading,
    Text,
    Alert,
    AlertIcon,
    Spinner,
    Button,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Separate the inner component that uses useStripe
const DonationSuccessContent = () => {
    const stripe = useStripe();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = searchParams.get('payment_intent_client_secret');

        if (!clientSecret) {
            setStatus('error');
            setMessage('No payment information found.');
            return;
        }

        stripe
            .retrievePaymentIntent(clientSecret)
            .then(({ paymentIntent }) => {
                switch (paymentIntent?.status) {
                    case 'succeeded':
                        setStatus('success');
                        setMessage('Thank you for your generous donation!');
                        break;
                    case 'processing':
                        setStatus('loading');
                        setMessage('Your payment is processing.');
                        break;
                    default:
                        setStatus('error');
                        setMessage('Something went wrong with your payment.');
                        break;
                }
            })
            .catch((e) => {
                setStatus('error');
                setMessage('An error occurred while checking payment status.');
                console.error('Error:', e);
            });
    }, [stripe, searchParams]);

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.50"
        >
            <VStack
                spacing={8}
                p={8}
                bg="white"
                borderRadius="lg"
                boxShadow="lg"
                maxW="600px"
                w="90%"
                textAlign="center"
            >
                {status === 'loading' && (
                    <>
                        <Spinner size="xl" color="blue.500" />
                        <Text fontSize="lg">Processing your donation...</Text>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <Heading size="xl" color="green.500">
                            Thank You! 🎉
                        </Heading>
                        <Alert status="success" borderRadius="md">
                            <AlertIcon />
                            {message}
                        </Alert>
                        <Text fontSize="lg" color="gray.600">
                            Your support means a lot to us. We'll use your donation to make a difference.
                        </Text>
                        <Button
                            colorScheme="blue"
                            size="lg"
                            onClick={() => navigate('/')}
                        >
                            Return Home
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <Heading size="xl" color="red.500">
                            Oops!
                        </Heading>
                        <Alert status="error" borderRadius="md">
                            <AlertIcon />
                            {message}
                        </Alert>
                        <Button
                            colorScheme="blue"
                            size="lg"
                            onClick={() => navigate('/')}
                        >
                            Try Again
                        </Button>
                    </>
                )}
            </VStack>
        </Box>
    );
};

// Wrapper component that provides Stripe Elements context
const DonationSuccess = () => {
    const [searchParams] = useSearchParams();
    const clientSecret = searchParams.get('payment_intent_client_secret');

    if (!clientSecret) {
        return (
            <Box
                minH="100vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="gray.50"
            >
                <Alert status="error">
                    <AlertIcon />
                    No payment information found
                </Alert>
            </Box>
        );
    }

    const options: StripeElementsOptions = {
        clientSecret,
        appearance: {
            theme: 'stripe',
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <DonationSuccessContent />
        </Elements>
    );
};

export default DonationSuccess;
