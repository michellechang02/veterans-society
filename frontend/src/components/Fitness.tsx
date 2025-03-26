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
  IconButton,
} from "@chakra-ui/react";
import { useAuth } from "../Auth/Auth";
import { useState, useEffect } from "react";
import axios from "axios";
import quotesy from "quotesy";
import { postFitnessData, postFitnessAddTaskData } from "../Api/postData";
import { deleteFitnessTaskData } from "../Api/deleteData";
import { Delete } from "react-feather";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

interface FitnessTask {
  username: string;
  task_id: string;
  description: string;
  is_finished: boolean;
}

const Fitness: React.FC = () => {
  const toast = useToast();
  const { isAdmin, username } = useAuth();
  const [tasks, setTasks] = useState<FitnessTask[]>([]);
  const [progress, setProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dailyQuote, setDailyQuote] = useState({ text: "", author: "" });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState("");

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
        author: quote.author || "Unknown",
      };
      setDailyQuote(newQuote);
      localStorage.setItem("dailyQuote", JSON.stringify(newQuote));
      localStorage.setItem("quoteDate", today);
    }
  };

  const fetchTasks = async (): Promise<FitnessTask[]> => {
    try {
      const response = await axios.get(
        `http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/fitness/${username}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data) {
        setTasks(response.data);

        // Recalculate progress
        const completedCount = response.data.filter(
          (task: FitnessTask) => task.is_finished
        ).length;
        const newProgress =
          response.data.length === 0
            ? 0
            : Math.round((completedCount / response.data.length) * 100);
        setProgress(newProgress);

        setCompletedTasks(
          response.data
            .filter((task: FitnessTask) => task.is_finished)
            .map((task: FitnessTask) => task.task_id)
        );

        return response.data;
      }
    } catch (error) {
      console.error("Error fetching fitness tasks:", error);
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
        task.task_id === taskId
          ? { ...task, is_finished: !task.is_finished }
          : task
      );

      // Compute progress directly from the updated tasks list
      const completedCount = updatedTasks.filter(
        (task) => task.is_finished
      ).length;
      const newProgress =
        updatedTasks.length === 0
          ? 0
          : Math.round((completedCount / updatedTasks.length) * 100);

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

      const completedCount = updatedTasks.filter(
        (task) => task.is_finished
      ).length;
      const newProgress =
        updatedTasks.length === 0
          ? 0
          : Math.round((completedCount / updatedTasks.length) * 100);
      setProgress(newProgress);
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !username) {
      toast({
        title: "Error",
        description: "Task cannot be empty",
        status: "error",
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
          is_finished: false,
        };

        // Optimistically update UI before fetching from backend
        setTasks((prevTasks) => [...prevTasks, newFitnessTask]);

        // Reset input field
        setNewTask("");
        setIsAddingTask(false);

        toast({
          title: "Success",
          description: "Task added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Fetch the latest tasks from backend to ensure consistency
        const updatedTasks = await fetchTasks();
        if (updatedTasks) {
          setTasks(updatedTasks);
        }
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Couldn't add new task",
        status: "error",
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
        const updatedTasks = prevTasks.filter(
          (task) => task.task_id !== taskId
        );

        // Recalculate progress with the updated list
        const completedCount = updatedTasks.filter(
          (task) => task.is_finished
        ).length;
        const newProgress =
          updatedTasks.length === 0
            ? 0
            : Math.round((completedCount / updatedTasks.length) * 100);
        setProgress(newProgress);

        setCompletedTasks(
          updatedTasks
            .filter((task) => task.is_finished)
            .map((task) => task.task_id)
        );
        return updatedTasks;
      });
      toast({
        title: "Task deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error deleting task",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      {isAdmin ? (
        <Box p={6} textAlign="center">
          <Text>
            Please navigate to{" "}
            <ChakraLink
              as={RouterLink}
              to="/users"
              color="blue.500"
              _hover={{ textDecoration: "underline" }}
            >
              Users
            </ChakraLink>{" "}
            page and click on their profile to view their task progress.
          </Text>
        </Box>
      ) : (
        <Box h="100vh" w="100%" p={6} bg="gray.50" overflowY="auto">
          <Box maxW="1200px" mx="auto">
            <Heading
              as="h2"
              size="xl"
              textAlign="center"
              mb={8}
              color="gray.700"
              fontFamily="heading"
              letterSpacing="tight"
              position="relative"
              _after={{
                content: '""',
                display: "block",
                width: "80px",
                height: "4px",
                bgColor: "gray.500",
                mx: "auto",
                mt: 2,
                borderRadius: "full",
              }}
            >
              Veteran Mission Tracker
            </Heading>
            {/* Daily Motivation */}
            <Box
              shadow="lg"
              p={6}
              height="auto"
              bgColor="white"
              mb={6}
              borderRadius="lg"
              mx={8}
            >
              <Heading
                as="h4"
                size="md"
                mb={4}
                color="black"
                fontFamily="heading"
              >
                Daily Motivation
              </Heading>
              <Text
                fontStyle="italic"
                textAlign="center"
                color="black"
                fontSize="md"
              >
                "{dailyQuote.text}"
              </Text>
              <Text mt={2} textAlign="right" fontSize="sm" color="gray.600">
                - {dailyQuote.author}
              </Text>
            </Box>

            <HStack spacing={6} justify="center" align="stretch" mb={6} mx={8}>
              {/* Fitness Goals Card */}
              <Box shadow="lg" p={6} bgColor="white" flex={1} borderRadius="lg">
                <Heading
                  as="h4"
                  size="md"
                  mb={4}
                  color="black"
                  fontFamily="heading"
                >
                  Fitness Progress
                </Heading>
                <Text mb={4} fontSize="sm" color="gray.700">
                  Complete your tasks to advance your mission. Keep the momentum
                  strong!
                </Text>
                <Progress
                  value={progress}
                  colorScheme="gray"
                  size="lg"
                  borderRadius="full"
                  bg="gray.100"
                />
                <Text
                  mt={4}
                  textAlign="center"
                  fontWeight="bold"
                  fontSize="lg"
                  color="black"
                >
                  {progress}% Mission Completed
                </Text>
              </Box>

              {/* Tactical Tasks Card */}
              <Box shadow="lg" p={6} bgColor="white" flex={1} borderRadius="lg">
                <HStack justify="space-between" mb={4}>
                  <Heading as="h4" size="md" color="black" fontFamily="heading">
                    Tactical Tasks
                  </Heading>
                  <Button
                    bg="gray.600"
                    color="white"
                    _hover={{ bg: "gray.700" }}
                    onClick={() => setIsAddingTask(true)}
                  >
                    Add Task
                  </Button>
                </HStack>

                <VStack
                  align="start"
                  spacing={4}
                  maxH="300px"
                  overflowY="auto"
                  pr={2}
                >
                  {isAddingTask && (
                    <HStack width="100%">
                      <Input
                        placeholder="Enter new task"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        borderColor="transparent"
                        bg="gray.50"
                        _focus={{
                          borderColor: "transparent",
                          boxShadow: "none",
                          bg: "gray.100",
                        }}
                        _hover={{
                          borderColor: "transparent",
                          bg: "gray.100",
                        }}
                      />
                      <Button
                        size="sm"
                        bg="gray.500"
                        color="white"
                        _hover={{ bg: "gray.600" }}
                        onClick={handleAddTask}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.300"
                        color="black"
                        onClick={() => {
                          setIsAddingTask(false);
                          setNewTask("");
                        }}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  )}

                  {tasks.length === 0 ? (
                    <Text
                      color="gray.500"
                      textAlign="center"
                      width="100%"
                      py={4}
                    >
                      No tasks yet. Add your first task!
                    </Text>
                  ) : (
                    tasks.map((task) => (
                      <HStack
                        key={task.task_id}
                        width="100%"
                        justify="space-between"
                        gap={4}
                        p={2}
                        borderRadius="md"
                        _hover={{ bg: "gray.50" }}
                      >
                        <Checkbox
                          isChecked={completedTasks.includes(task.task_id)}
                          onChange={() => handleTaskToggle(task.task_id)}
                          colorScheme="gray"
                          size="lg"
                        >
                          <Text
                            color="black"
                            textDecoration={
                              completedTasks.includes(task.task_id)
                                ? "line-through"
                                : "none"
                            }
                          >
                            {task.description}
                          </Text>
                        </Checkbox>
                        <IconButton
                          aria-label="Delete task"
                          icon={<Delete size={18} />}
                          size="sm"
                          variant="ghost"
                          color="gray.500"
                          _hover={{ bg: "red.50", color: "red.500" }}
                          onClick={() => handleDeleteTask(task.task_id)}
                        />
                      </HStack>
                    ))
                  )}
                </VStack>
              </Box>
            </HStack>

            {/* Support Resources */}
            <Box shadow="lg" p={6} bgColor="white" borderRadius="lg" mx={8}>
              <Heading
                as="h4"
                size="md"
                mb={4}
                color="black"
                fontFamily="heading"
              >
                Veteran Support Resources
              </Heading>
              <VStack align="start" spacing={4}>
                <HStack spacing={4} width="100%">
                  <Box bg="gray.100" p={3} borderRadius="md" color="gray.500">
                    <strong>Veterans Crisis Line:</strong> Call 1-800-273-8255,
                    Press 1
                  </Box>
                </HStack>
                <HStack spacing={4} width="100%">
                  <Box bg="gray.100" p={3} borderRadius="md" color="gray.500">
                    <strong>VA Benefits:</strong>{" "}
                    <a
                      href="https://www.va.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "gray" }}
                    >
                      Visit VA.gov
                    </a>
                  </Box>
                </HStack>
                <HStack spacing={4} width="100%">
                  <Box bg="gray.100" p={3} borderRadius="md" color="gray.500">
                    <strong>Local Meetups:</strong> Join veteran support groups
                    in your community.
                  </Box>
                </HStack>
              </VStack>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Fitness;
