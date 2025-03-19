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
    Flex
} from '@chakra-ui/react';
import { useAuth } from "../../Auth/Auth";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { postFitnessAddTaskData } from '../../Api/postData';
import { deleteFitnessTaskData } from '../../Api/deleteData';
import { getOtherUserData } from '../../Api/getData';
import { Delete } from "react-feather";
import { useParams } from "react-router-dom";

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
    const [tasks, setTasks] = useState<FitnessTask[]>([]);
    const [progress, setProgress] = useState(0);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState('');

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

    return (
        <Box p={8} maxW="900px" mx="auto">
            <Heading as="h2" size="lg" textAlign="center" mb={8}>
                Admin Mission Tracker
            </Heading>
            {selectedUser ? (
                <Box mt={8} p={8} shadow="lg" bgColor="white">
                    <Heading as="h4" size="md" mb={4}>Tasks for {userData.firstName} {userData.lastName}</Heading>
                    <Progress value={progress} size="lg" borderRadius="full" />
                    <Text mt={4} textAlign="center" fontWeight="bold" fontSize="lg">
                        {progress}% Mission Completed
                    </Text>
                    <HStack justify="space-between" mt={4}>
                        <Button bgColor="gray.500" color="white" onClick={() => setIsAddingTask(true)}>
                            Add Task
                        </Button>
                    </HStack>
                    {isAddingTask && (
                        <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
                            <Input
                                placeholder="Enter new task"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                mb={3}
                            />
                            <HStack spacing={3}>
                                <Button size="sm" onClick={handleAddTask}>Add</Button>
                                <Button size="sm" onClick={() => setIsAddingTask(false)}>Cancel</Button>
                            </HStack>
                        </Box>
                    )}
                    <VStack spacing={4} align="stretch" mt={4}>
                        {tasks.map(task => (
                            <Box
                                key={task.task_id}
                                p={4}
                                borderWidth="2px"
                                borderRadius="lg"
                                shadow="md"
                                bg="white"
                                _hover={{ shadow: "lg" }}
                                transition="all 0.2s"
                            >
                                <Flex align="center" justify="space-between">
                                    <Text fontSize="md" fontWeight="medium">{task.description}</Text>
                                    <IconButton
                                        aria-label="Delete task"
                                        icon={<Delete />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        _hover={{ bg: "red.50" }}
                                        onClick={() => handleDeleteTask(task.task_id)}
                                    />
                                </Flex>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            ) : (
                <Text>No user selected</Text>
            )}
        </Box>
    );
};

export default AdminFitness;
