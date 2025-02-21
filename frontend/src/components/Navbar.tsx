import { Box, VStack, useMediaQuery, Image, Avatar, Button, IconButton, Center } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/Auth';
import { useEffect, useState } from 'react';
import { getUserProfilePic } from '../Api/getData';
import { LogOut, LogIn } from 'react-feather';

const Navbar: React.FC = () => {
    const [isDesktop] = useMediaQuery('(min-width: 48em)');
    const navigate = useNavigate();
    const { username, setUsername } = useAuth();
    const [profilePic, setProfilePic] = useState<string>('')

    const handleLogout = () => {
        sessionStorage.clear();
        setUsername(null);
        navigate('/login');
    };

    useEffect(() => {
        const fetchProfilePic = async () => {
            if (username !== null && username !== undefined) {
                try {
                    const pfp = await getUserProfilePic(username!);
                    setProfilePic(pfp);
                } catch (error) {
                    console.error("Failed to fetch profile picture:", error);
                }
            }
        };

        fetchProfilePic();
    }, [username]);

    return (
        <Box as="nav" bg="bg-surface" boxShadow="md" width="150px" height="100vh" position="fixed" left={0} top={0} p={6}>
            <Center height="100%">
                <VStack align="center" spacing={8} height="100%" justify="space-between">
                    {/* Logo Section */}
                    <Button
                        colorScheme="white"
                        borderRadius="full"
                        onClick={() => navigate('/')}
                        variant="ghost"
                    >
                        <Image src="/vite.png" alt="Logo" boxSize="60px" />
                    </Button>

                    {/* Navigation Buttons */}
                    {isDesktop && username && (
                        <VStack align="center" spacing={4}>
                            <Button onClick={() => navigate(`/`)} variant="ghost">Home</Button>
                            <Button onClick={() => navigate(`/${username}/feed`)} variant="ghost">Feed</Button>
                            <Button onClick={() => navigate(`/${username}/chat`)} variant="ghost">Chat</Button>
                            <Button onClick={() => navigate(`/${username}/groups`)} variant="ghost">Groups</Button>
                            <Button onClick={() => navigate(`/${username}/fitness`)} variant="ghost">Fitness</Button>
                            <Button onClick={() => navigate(`/${username}/search`)} variant="ghost">Users</Button>
                            <Button onClick={() => navigate(`/donate`)} variant="ghost">Donate</Button>
                            <Button onClick={() => navigate(`/resources`)} variant="ghost">Resources</Button>
                        </VStack>
                    )}

                    {/* Profile and Logout */}
                    {isDesktop && username && (
                        <VStack align="center" spacing={4} mt="auto">
                            <Button
                                onClick={() => {
                                    navigate(`/${username}/users`);
                                }}
                                variant="ghost"
                                borderRadius="full"
                                _hover={{ bg: 'transparent' }}
                            >
                                <Avatar size="md" name={username} src={profilePic} />
                            </Button>
                            <IconButton
                                onClick={handleLogout}
                                icon={<LogOut />}
                                aria-label="Logout"
                                _focus={{ boxShadow: 'none' }}
                                variant="ghost"
                                size="lg"
                            />
                        </VStack>
                    )}

                    {/* Login Button */}
                    {isDesktop && !username && (
                        <Button
                            onClick={() => navigate('/login')}
                            variant="ghost"
                        >
                            Login
                        </Button>
                    )}

                    {/* Mobile View */}
                    {!isDesktop && (
                        <IconButton
                            aria-label="Open Menu"
                            variant="ghost"
                            icon={<LogIn />}
                        />
                    )}
                </VStack>
            </Center>
        </Box>
    );
};

export default Navbar;
