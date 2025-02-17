import {
  Box,
  Heading,
  Text,
  VStack,
  Progress,
  HStack,
  Checkbox,
  Button,
  Input,
  useToast,
  IconButton
} from '@chakra-ui/react';
import { useAuth } from "../Auth/Auth";
import { useState, useEffect } from 'react';
import axios from 'axios';
import quotesy from 'quotesy';
import { postFitnessData, postFitnessAddTaskData } from '../Api/postData';
import { deleteFitnessTaskData } from '../Api/deleteData';
import { Delete } from "react-feather";

interface FitnessTask {
  username: string;
  task_id: string;
  description: string;
  is_finished: boolean;
};

const Fitness: React.FC = () => {
  const toast = useToast();
  const { username } = useAuth();
  const [tasks, setTasks] = useState<FitnessTask[]>([]);
  const [progress, setProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dailyQuote, setDailyQuote] = useState({ text: "", author: "" });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState('');

  // Function to get a new quote only if a new day has started
  const getDailyQuote = () => {
    const storedQuote = localStorage.getItem("dailyQuote");
    const storedDate = localStorage.getItem("quoteDate");
    const today = new Date().toDateString(); // Get today's date as a string

    if (storedQuote && storedDate === today) {
      setDailyQuote(JSON.parse(storedQuote)); // Use stored quote
    } else {
      const quote = quotesy.random();
      const newQuote = {
        text: quote.text,
        author: quote.author || "Unknown"
      };
      setDailyQuote(newQuote);
      localStorage.setItem("dailyQuote", JSON.stringify(newQuote));
      localStorage.setItem("quoteDate", today);
    }
  };

  const fetchTasks = async (): Promise<FitnessTask[]> => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/fitness/${username}`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (response.data) {
        setTasks(response.data);

        // Recalculate progress
        const completedCount = response.data.filter((task: FitnessTask) => task.is_finished).length;
        const newProgress = response.data.length === 0 ? 0 : Math.round((completedCount / response.data.length) * 100);
        setProgress(newProgress);

        setCompletedTasks(response.data.filter((task: FitnessTask) => task.is_finished).map((task: FitnessTask) => task.task_id));

        return response.data;
      }
    } catch (error) {
      console.error('Error fetching fitness tasks:', error);
      return [];
    }

    return [];
  };

  useEffect(() => {
    getDailyQuote(); // Fetch the daily quote once per day
  }, []);

  useEffect(() => {
    if (!username) return;

    fetchTasks();
  }, [username]);


  const handleTaskToggle = async (taskId: string) => {
    if (!username) return;

    // Optimistic UI Update: update tasks before server response
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.task_id === taskId ? { ...task, is_finished: !task.is_finished } : task
      );

      // Compute progress directly from the updated tasks list
      const completedCount = updatedTasks.filter(task => task.is_finished).length;
      const newProgress = updatedTasks.length === 0 ? 0 : Math.round((completedCount / updatedTasks.length) * 100);

      setProgress(newProgress);
      return updatedTasks;
    });

    setCompletedTasks((prevCompletedTasks) => {
      const isNowFinished = !completedTasks.includes(taskId);

      return isNowFinished
        ? [...prevCompletedTasks, taskId]
        : prevCompletedTasks.filter((t) => t !== taskId);
    });

    try {
      const response = await postFitnessData(username, taskId);

      if (!response.success) {
        return;
      }

      // Final sync with AWS after successful update
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);

      const completedCount = updatedTasks.filter(task => task.is_finished).length;
      const newProgress = updatedTasks.length === 0 ? 0 : Math.round((completedCount / updatedTasks.length) * 100);
      setProgress(newProgress);

    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !username) {
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
      const response = await postFitnessAddTaskData(username, newTask);

      if (response.task_id) {
        const newFitnessTask: FitnessTask = {
          username: username,
          task_id: response.task_id,
          description: newTask,
          is_finished: false
        };

        // Optimistically update UI before fetching from backend
        setTasks((prevTasks) => [...prevTasks, newFitnessTask]);

        // Reset input field
        setNewTask('');
        setIsAddingTask(false);

        toast({
          title: 'Success',
          description: 'Task added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Fetch the latest tasks from backend to ensure consistency
        const updatedTasks = await fetchTasks();
        if (updatedTasks) {
          setTasks(updatedTasks);
        }
      } else {
        throw new Error('Invalid response structure');
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
    if (!username) return;

    try {
      await deleteFitnessTaskData(username, taskId);

      // Optimistic UI update
      // Remove the task from the state
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.filter(task => task.task_id !== taskId);

        // Recalculate progress with the updated list
        const completedCount = updatedTasks.filter(task => task.is_finished).length;
        const newProgress = updatedTasks.length === 0 ? 0 : Math.round((completedCount / updatedTasks.length) * 100);
        setProgress(newProgress);

        setCompletedTasks(updatedTasks.filter(task => task.is_finished).map(task => task.task_id));
        return updatedTasks;
      });
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
      <Heading as="h2" size="lg" textAlign="center" mb={8} color="black" fontFamily="body">
        Veteran Mission Tracker
      </Heading>
      {/* Daily Motivation */}
      <Box
        shadow="lg"
        p={8}
        height="auto"
        mt={8}
        bgColor="white"
        marginBottom="20px"
      >
        <Heading as="h4" size="md" mb={4} color="black" fontFamily="heading">
          Daily Motivation
        </Heading>
        <Text fontStyle="italic" textAlign="center" color="black">
          "{dailyQuote.text}"
        </Text>
        <Text mt={2} textAlign="right" fontSize="sm" color="gray.600">
          - {dailyQuote.author}
        </Text>
      </Box>

      <HStack spacing={6} justify="center" align='stretch'>
        {/* Fitness Goals Card */}
        <Box shadow="lg" p={8} bgColor="white" flex={1}>
          <Heading as="h4" size="md" mb={4} color="black" fontFamily="heading">
            Fitness Progress
          </Heading>
          <Text mb={4} fontSize="sm" color="black">
            Complete your tasks to advance your mission. Keep the momentum strong!
          </Text>
          <Progress value={progress} colorScheme="gray" size="lg" borderRadius="full" />
          <Text mt={4} textAlign="center" fontWeight="bold" fontSize="lg" color="black">
            {progress}% Mission Completed
          </Text>
        </Box>

        {/* Tactical Tasks Card */}
        <Box shadow="lg" p={8} bgColor="white" flex={1}>
          <HStack justify="space-between" mb={4}>
            <Heading as="h4" size="md" color="black" fontFamily="heading">
              Tactical Tasks
            </Heading>
            <Button bgColor="gray.500" color="white"
              onClick={() => setIsAddingTask(true)}
            >
              Add Task
            </Button>
          </HStack>

          <VStack align="start" spacing={4}>
            {isAddingTask && (
              <HStack width="100%">
                <Input
                  placeholder="Enter new task"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <Button size="sm" bgColor="gray.500" color="white" onClick={handleAddTask}>
                  Add
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTask('');
                  }}
                >
                  Cancel
                </Button>
              </HStack>
            )}

            {tasks.map((task) => (
              <HStack key={task.task_id} width="100%" justify="space-between" gap={4}>
                <Checkbox
                  isChecked={completedTasks.includes(task.task_id)}
                  onChange={() => handleTaskToggle(task.task_id)}
                  colorScheme="gray"
                >
                  <Text color="black">{task.description}</Text>
                </Checkbox>
                <IconButton
                  aria-label="Delete task"
                  icon={<Delete />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleDeleteTask(task.task_id)}
                />
              </HStack>
            ))}
          </VStack>

        </Box>
      </HStack>

      {/* Support Resources */}
      <Box
        shadow="lg"
        p={8}
        mt={8}
        bgColor="white"
      >
        <Heading as="h4" size="md" mb={4} color="black" fontFamily="heading">
          Veteran Support Resources
        </Heading>
        <VStack align="start" spacing={4}>
          <Text color="black">
            <strong>Veterans Crisis Line:</strong> Call 1-800-273-8255, Press 1
          </Text>
          <Text color="black">
            <strong>VA Benefits:</strong>{' '}
            <a href="https://www.va.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'gray' }}>
              Visit VA.gov
            </a>
          </Text>
          <Text color="black">
            <strong>Local Meetups:</strong> Join veteran support groups in your community.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default Fitness;
