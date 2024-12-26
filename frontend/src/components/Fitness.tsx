import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Progress,
  Heading,
  Checkbox,
  Grid,
} from '@chakra-ui/react';

const Fitness = () => {
  const [tasks, setTasks] = useState<string[]>([
    'Morning PT (Physical Training)',
    'Complete VA Benefits Application',
    'Team March (5 Miles)',
    'Update Resume for Civilian Jobs',
    'Meditation for Stress Management',
    'Walk with Service Dog',
  ]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);

  // Update progress based on completed tasks
  useEffect(() => {
    const completedCount = completedTasks.length;
    const totalCount = tasks.length;
    const calculatedProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    setProgress(Math.round(calculatedProgress)); // Round to nearest integer
  }, [completedTasks, tasks]);

  const handleTaskToggle = (task: string) => {
    setCompletedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  return (
    <Box p={8} maxW="900px" mx="auto">
      <Heading as="h2" size="lg" textAlign="center" mb={8} color="gray.500" fontFamily="body">
        Veteran Mission Tracker
      </Heading>
      

      <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
        {/* Fitness Goals Card */}
        <Box
          shadow="lg"
          p={8}
          bgColor="gray.500"
          borderRadius="lg"
        >
          <Heading as="h4" size="md" mb={4} color="white" fontFamily="heading">
            Fitness Progress
          </Heading>
          <Text mb={4} fontSize="sm" color="gray.200">
            Complete your tasks to advance your mission. Keep the momentum strong!
          </Text>
          <Progress value={progress} colorScheme="green" size="lg" borderRadius="full" />
          <Text mt={4} textAlign="center" fontWeight="bold" fontSize="lg" color="white">
            {progress}% Mission Completed
          </Text>
        </Box>

        

        {/* Tactical Tasks Card */}
        <Box
          shadow="lg"
          p={8}
          bgColor="gray.500"
          borderRadius="lg"
        >
          <Heading as="h4" size="md" mb={4} color="white" fontFamily="heading">
            Tactical Tasks
          </Heading>
          <VStack align="start" spacing={4}>
            {tasks.map((task) => (
              <HStack key={task}>
                <Checkbox
                  isChecked={completedTasks.includes(task)}
                  onChange={() => handleTaskToggle(task)}
                  colorScheme="green"
                >
                  <Text color="gray.200">{task}</Text>
                </Checkbox>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Grid>

      {/* Daily Motivation */}
      <Box
        shadow="lg"
        p={8}
        mt={8}
        bgColor="gray.500"
        borderRadius="lg"
      >
        <Heading as="h4" size="md" mb={4} color="white" fontFamily="heading">
          Daily Motivation
        </Heading>
        <Text fontStyle="italic" textAlign="center" color="gray.200">
          "Discipline is the soul of an army. It makes small numbers formidable; procures success to the weak, and esteem to all."
        </Text>
      </Box>

      {/* Support Resources */}
      <Box
        shadow="lg"
        p={8}
        mt={8}
        bgColor="gray.500"
        borderRadius="lg"
      >
        <Heading as="h4" size="md" mb={4} color="white" fontFamily="heading">
          Veteran Support Resources
        </Heading>
        <VStack align="start" spacing={4}>
          <Text color="gray.200">
            <strong>Veterans Crisis Line:</strong> Call 1-800-273-8255, Press 1
          </Text>
          <Text color="gray.200">
            <strong>VA Benefits:</strong>{' '}
            <a href="https://www.va.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'lightgreen' }}>
              Visit VA.gov
            </a>
          </Text>
          <Text color="gray.200">
            <strong>Local Meetups:</strong> Join veteran support groups in your community.
          </Text>
        </VStack>
      </Box>

      
    </Box>
  );
};

export default Fitness;
