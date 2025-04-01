import {
    Box,
    Heading,
    Text,
    VStack,
    Progress,
    HStack,
    Button,
    Input,
    useToast,
    IconButton,
    Flex,
    Container,
    useColorModeValue
} from '@chakra-ui/react';
import { useAuth } from "../../Auth/Auth";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { postFitnessAddTaskData } from '../../Api/postData';
import { deleteFitnessTaskData } from '../../Api/deleteData';
import { getOtherUserData } from '../../Api/getData';
import { Delete, ArrowLeft } from "react-feather";
import { useParams, useNavigate } from "react-router-dom";

interface FitnessTask {
    username: string;
    task_id: string;
    description: string;
    is_finished: boolean;
};

const AdminFitness: React.FC = () => {
    const toast = useToast();
    const { username: adminUsername, authToken } = useAuth();
    const { username: selectedUser } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<FitnessTask[]>([]);
    const [progress, setProgress] = useState(0);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState('');

    // Color mode values
    const bgColor = useColorModeValue("white", "gray.800");
    const containerBg = useColorModeValue("gray.50", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("black", "white");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const buttonBg = useColorModeValue("black", "gray.600");
    const buttonHoverBg = useColorModeValue("gray.700", "gray.500");
    const progressBg = useColorModeValue("gray.100", "gray.700");
    const progressTrackBg = useColorModeValue("gray.50", "gray.800");
    const hoverBg = useColorModeValue("gray.50", "gray.700");
    const inputBg = useColorModeValue("white", "gray.700");
    const dashedBg = useColorModeValue("gray.50", "gray.700");

    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        profilePic: ''
    });

    useEffect(() => {
        if (adminUsername && authToken && selectedUser) {
            getOtherUserData({ username: selectedUser, setUserData, toast });
        }
    }, [selectedUser, toast, authToken, adminUsername]);

    useEffect(() => {
        if (selectedUser && authToken) {
            fetchTasks(selectedUser);
        }
    }, [selectedUser, authToken]);

    const fetchTasks = async (user: string) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/fitness/${user}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                withCredentials: true,
            });
            setTasks(response.data);
            updateProgress(response.data);
        } catch (error) {
            console.error('Error fetching fitness tasks:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch tasks',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const updateProgress = (taskList: FitnessTask[]) => {
        const completedCount = taskList.filter(task => task.is_finished).length;
        setProgress(taskList.length === 0 ? 0 : Math.round((completedCount / taskList.length) * 100));
    };

    const handleAddTask = async () => {
        if (!newTask.trim() || !selectedUser) {
            toast({
                title: 'Error',
                description: 'Task cannot be empty',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await postFitnessAddTaskData(selectedUser, newTask);
            if (response.task_id) {
                setTasks((prevTasks) => [...prevTasks, {
                    username: selectedUser,
                    task_id: response.task_id,
                    description: newTask,
                    is_finished: false
                }]);
                setNewTask('');
                setIsAddingTask(false);
                toast({
                    title: 'Success',
                    description: 'Task added successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                fetchTasks(selectedUser);
            }
        } catch (error) {
            console.error('Error adding task:', error);
            toast({
                title: 'Error',
                description: 'Couldn\'t add new task',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!selectedUser) return;
        try {
            await deleteFitnessTaskData(selectedUser, taskId);
            const updatedTasks = tasks.filter(task => task.task_id !== taskId);
            setTasks(updatedTasks);
            updateProgress(updatedTasks);
            toast({
                title: "Task deleted successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error deleting task:', error);
            toast({
                title: "Error deleting task",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleBackButton = () => {
        navigate(`/${adminUsername}/visit/${selectedUser}`);
    };

    return (
        <Container maxW="900px" py={8} bg={containerBg} borderRadius="xl" shadow="sm">
            <Button
                    leftIcon={<ArrowLeft />}
                    variant="outline"
                    size="sm"
                    mb={4}
                    borderColor={borderColor}
                    bg={bgColor}
                    color={textColor}
                    shadow="sm"
                    _hover={{ bg: hoverBg }}
                    onClick={handleBackButton}
                >
                    Back to Profile
                </Button>
            <Box textAlign="center" mb={6}>
                
                
                <Heading as="h2" size="lg" color={textColor}>
                    Mission Tracker for {userData.firstName} {userData.lastName}
                </Heading>
            </Box>
            
            {selectedUser ? (
                <Box 
                    p={8} 
                    shadow="md" 
                    bg={bgColor} 
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                >
                    <Heading as="h4" size="md" mb={6} color={textColor}>Tasks for {userData.firstName} {userData.lastName}</Heading>
                    
                    <Box mb={8} p={2} bg={progressTrackBg} borderRadius="lg">
                        <Progress 
                            value={progress} 
                            size="lg" 
                            borderRadius="full" 
                            colorScheme="gray"
                            bg={progressBg}
                        />
                        <Text mt={4} textAlign="center" fontWeight="bold" fontSize="lg" color={textColor}>
                            {progress}% Mission Completed
                        </Text>
                    </Box>
                    
                    <HStack justify="space-between" mb={6}>
                        <Button 
                            bg={buttonBg} 
                            color="white"
                            _hover={{ bg: buttonHoverBg }}
                            onClick={() => setIsAddingTask(true)}
                            shadow="sm"
                            borderRadius="md"
                        >
                            Add Task
                        </Button>
                    </HStack>
                    
                    {isAddingTask && (
                        <Box 
                            mt={4} 
                            p={5} 
                            borderWidth="1px" 
                            borderRadius="md"
                            borderColor={borderColor} 
                            bg={bgColor}
                            shadow="sm"
                            mb={6}
                        >
                            <Input
                                placeholder="Enter new task"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                mb={4}
                                focusBorderColor={buttonBg}
                                bg={inputBg}
                            />
                            <HStack spacing={3}>
                                <Button 
                                    size="sm" 
                                    bg={buttonBg}
                                    color="white"
                                    _hover={{ bg: buttonHoverBg }}
                                    onClick={handleAddTask}
                                    shadow="sm"
                                >
                                    Add
                                </Button>
                                <Button 
                                    size="sm"
                                    variant="outline"
                                    borderColor={borderColor}
                                    onClick={() => setIsAddingTask(false)}
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </Box>
                    )}
                    
                    <VStack spacing={4} align="stretch">
                        {tasks.map(task => (
                            <Box
                                key={task.task_id}
                                p={4}
                                borderWidth="1px"
                                borderRadius="lg"
                                shadow="sm"
                                bg={bgColor}
                                borderColor={borderColor}
                                _hover={{ shadow: "md", borderColor: useColorModeValue("gray.300", "gray.600") }}
                                transition="all 0.2s"
                            >
                                <Flex align="center" justify="space-between">
                                    <Text fontSize="md" fontWeight="medium" color={textColor}>{task.description}</Text>
                                    <IconButton
                                        aria-label="Delete task"
                                        icon={<Delete size={18} />}
                                        size="sm"
                                        variant="ghost"
                                        color={subTextColor}
                                        _hover={{ bg: hoverBg, color: "red.500" }}
                                        onClick={() => handleDeleteTask(task.task_id)}
                                    />
                                </Flex>
                            </Box>
                        ))}
                    </VStack>
                    
                    {tasks.length === 0 && (
                        <Box 
                            textAlign="center" 
                            py={10} 
                            color={subTextColor}
                            borderWidth="1px"
                            borderRadius="md"
                            borderColor={borderColor}
                            borderStyle="dashed"
                            bg={dashedBg}
                        >
                            <Text>No tasks assigned yet</Text>
                        </Box>
                    )}
                </Box>
            ) : (
                <Box p={8} shadow="md" bg={bgColor} borderRadius="lg" textAlign="center">
                    <Text color={subTextColor}>No user selected</Text>
                </Box>
            )}
        </Container>
    );
};

export default AdminFitness;
