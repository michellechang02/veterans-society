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
} from "@chakra-ui/react";
import { useAuth } from "../../Auth/Auth";
import { useState, useEffect } from "react";
import axios from "axios";
import { postFitnessAddTaskData } from "../../Api/postData";
import { deleteFitnessTaskData } from "../../Api/deleteData";
import { getOtherUserData } from "../../Api/getData";
import { Delete, ArrowLeft } from "react-feather";
import { useParams, useNavigate } from "react-router-dom";

interface FitnessTask {
  username: string;
  task_id: string;
  description: string;
  is_finished: boolean;
}

const AdminFitness: React.FC = () => {
  const toast = useToast();
  const { username: adminUsername, authToken } = useAuth();
  const { username: selectedUser } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<FitnessTask[]>([]);
  const [progress, setProgress] = useState(0);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState("");

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    profilePic: "",
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
      const response = await axios.get(
        `http://ec2-3-83-39-212.compute-1.amazonaws.com:8000/fitness/${user}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          withCredentials: true,
        }
      );
      setTasks(response.data);
      updateProgress(response.data);
    } catch (error) {
      console.error("Error fetching fitness tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateProgress = (taskList: FitnessTask[]) => {
    const completedCount = taskList.filter((task) => task.is_finished).length;
    setProgress(
      taskList.length === 0
        ? 0
        : Math.round((completedCount / taskList.length) * 100)
    );
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !selectedUser) {
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
      const response = await postFitnessAddTaskData(selectedUser, newTask);
      if (response.task_id) {
        setTasks((prevTasks) => [
          ...prevTasks,
          {
            username: selectedUser,
            task_id: response.task_id,
            description: newTask,
            is_finished: false,
          },
        ]);
        setNewTask("");
        setIsAddingTask(false);
        toast({
          title: "Success",
          description: "Task added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchTasks(selectedUser);
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
    if (!selectedUser) return;
    try {
      await deleteFitnessTaskData(selectedUser, taskId);
      const updatedTasks = tasks.filter((task) => task.task_id !== taskId);
      setTasks(updatedTasks);
      updateProgress(updatedTasks);
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

  const handleBackButton = () => {
    navigate(`/${adminUsername}/visit/${selectedUser}`);
  };

  return (
    <Container maxW="900px" py={8} bg="gray.50" borderRadius="xl" shadow="sm">
      <Button
        leftIcon={<ArrowLeft />}
        variant="outline"
        size="sm"
        mb={4}
        borderColor="gray.300"
        bg="white"
        color="black"
        shadow="sm"
        _hover={{ bg: "gray.100" }}
        onClick={handleBackButton}
      >
        Back to Profile
      </Button>
      <Box textAlign="center" mb={6}>
        <Heading as="h2" size="lg" color="black">
          Mission Tracker for {userData.firstName} {userData.lastName}
        </Heading>
      </Box>

      {selectedUser ? (
        <Box
          p={8}
          shadow="md"
          bg="white"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <Heading as="h4" size="md" mb={6} color="black">
            Tasks for {userData.firstName} {userData.lastName}
          </Heading>

          <Box mb={8} p={2} bg="gray.50" borderRadius="lg">
            <Progress
              value={progress}
              size="lg"
              borderRadius="full"
              colorScheme="gray"
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

          <HStack justify="space-between" mb={6}>
            <Button
              bg="black"
              color="white"
              _hover={{ bg: "gray.700" }}
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
              borderColor="gray.200"
              bg="white"
              shadow="sm"
              mb={6}
            >
              <Input
                placeholder="Enter new task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                mb={4}
                focusBorderColor="black"
                bg="white"
              />
              <HStack spacing={3}>
                <Button
                  size="sm"
                  bg="black"
                  color="white"
                  _hover={{ bg: "gray.700" }}
                  onClick={handleAddTask}
                  shadow="sm"
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="gray.300"
                  onClick={() => setIsAddingTask(false)}
                >
                  Cancel
                </Button>
              </HStack>
            </Box>
          )}

          <VStack spacing={4} align="stretch">
            {tasks.map((task) => (
              <Box
                key={task.task_id}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                shadow="sm"
                bg="white"
                borderColor="gray.200"
                _hover={{ shadow: "md", borderColor: "gray.300" }}
                transition="all 0.2s"
              >
                <Flex align="center" justify="space-between">
                  <Text fontSize="md" fontWeight="medium" color="black">
                    {task.description}
                  </Text>
                  <IconButton
                    aria-label="Delete task"
                    icon={<Delete size={18} />}
                    size="sm"
                    variant="ghost"
                    color="gray.500"
                    _hover={{ bg: "gray.50", color: "red.500" }}
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
              color="gray.500"
              borderWidth="1px"
              borderRadius="md"
              borderColor="gray.200"
              borderStyle="dashed"
              bg="gray.50"
            >
              <Text>No tasks assigned yet</Text>
            </Box>
          )}
        </Box>
      ) : (
        <Box p={8} shadow="md" bg="white" borderRadius="lg" textAlign="center">
          <Text color="gray.500">No user selected</Text>
        </Box>
      )}
    </Container>
  );
};

export default AdminFitness;
