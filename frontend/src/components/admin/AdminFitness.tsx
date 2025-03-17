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
    IconButton
} from '@chakra-ui/react';
import { useAuth } from "../../Auth/Auth";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { postFitnessAddTaskData } from '../../Api/postData';
import { deleteFitnessTaskData } from '../../Api/deleteData';
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
    const { username: adminUsername } = useAuth();
    const [users, setUsers] = useState<string[]>([]);
    const { selectedUser } = useParams()
    const [tasks, setTasks] = useState<FitnessTask[]>([]);
    const [progress, setProgress] = useState(0);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/users`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const fetchTasks = async (user: string) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/fitness/${user}`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            setTasks(response.data);
            const completedCount = response.data.filter((task: FitnessTask) => task.is_finished).length;
            setProgress(response.data.length === 0 ? 0 : Math.round((completedCount / response.data.length) * 100));
        } catch (error) {
            console.error('Error fetching fitness tasks:', error);
        }
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
            setTasks((prevTasks) => prevTasks.filter(task => task.task_id !== taskId));
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
            {selectedUser && (
                <Box mt={8} p={8} shadow="lg" bgColor="white">
                    <Heading as="h4" size="md" mb={4}>Tasks for {selectedUser}</Heading>
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
                        <HStack mt={4}>
                            <Input
                                placeholder="Enter new task"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                            />
                            <Button size="sm" onClick={handleAddTask}>Add</Button>
                            <Button size="sm" onClick={() => setIsAddingTask(false)}>Cancel</Button>
                        </HStack>
                    )}
                    <VStack align="start" spacing={4} mt={4}>
                        {tasks.map(task => (
                            <HStack key={task.task_id} width="100%" justify="space-between">
                                <Text>{task.description}</Text>
                                <IconButton
                                    aria-label="Delete task"
                                    icon={<Delete />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleDeleteTask(task.task_id)}
                                />
                            </HStack>
                        ))}
                    </VStack>
                </Box>
            )}
        </Box>
    );
};

export default AdminFitness;
