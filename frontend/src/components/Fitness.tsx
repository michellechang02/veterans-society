import { Box, Heading, Text, VStack, Progress, Grid, HStack, Checkbox } from '@chakra-ui/react';
import { useAuth } from "../Auth/Auth";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { postFitnessData } from '../Api/postData';
import quotesy from 'quotesy';


interface FitnessTask {
  username: string;
  task_id: string;
  description: string;
  is_finished: boolean;
}

const Fitness: React.FC = () => {
  const { username } = useAuth();
  const [tasks, setTasks] = useState<FitnessTask[]>([]);
  const [progress, setProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dailyQuote, setDailyQuote] = useState({ text: "", author: "" });
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

  useEffect(() => {
    getDailyQuote(); // Fetch the daily quote once per day
  }, []);


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/fitness/${username}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        });
        setTasks(response.data);
        setCompletedTasks(response.data.filter((task: FitnessTask) => task.is_finished).map((task: FitnessTask) => task.task_id));
      } catch (error) {
        console.error('Error fetching fitness tasks:', error);
      }
    };

    if (username) {
      fetchTasks();
    }
  }, [username]);

  const handleTaskToggle = async (taskId: string) => {
    if (!username) return;

    // 🔥 Optimistic UI Update: update `tasks` before server response
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.task_id === taskId ? { ...task, is_finished: !task.is_finished } : task
      )
    );

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

      // 🔥 Final sync with AWS after successful update
      const updatedTasks = await fetchTasks(username);
      setTasks(updatedTasks);
      setCompletedTasks(updatedTasks.filter((task) => task.is_finished).map((task) => task.task_id));

      setProgress(Math.round((updatedTasks.filter((task) => task.is_finished).length / updatedTasks.length) * 100));

    } catch (error) {
      console.error("Error toggling task:", error);
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

      <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
        {/* Fitness Goals Card */}
        <Box shadow="lg" p={8} bgColor="white">
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
        <Box shadow="lg" p={8} bgColor="white">
          <Heading as="h4" size="md" mb={4} color="black" fontFamily="heading">
            Tactical Tasks
          </Heading>
          <VStack align="start" spacing={4}>
            {tasks.map((task) => (
              <HStack key={task.task_id}>
                <Checkbox
                  isChecked={completedTasks.includes(task.task_id)}
                  onChange={() => handleTaskToggle(task.task_id)}
                  colorScheme="gray"
                >
                  <Text color="black">{task.description}</Text>
                </Checkbox>
              </HStack>
            ))}
          </VStack>
        </Box>

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
      </Grid>
    </Box>
  );
};

export default Fitness;
