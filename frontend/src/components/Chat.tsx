import React, { useState, useEffect } from 'react';
import { Box, HStack, Input, Button, Text, Grid, GridItem, Heading, Modal, ModalOverlay, ModalContent, useDisclosure, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast } from '@chakra-ui/react';
import useWebSocket from 'react-use-websocket';
import axios from 'axios';
import { useAuth } from '../Auth/Auth';

const API_BASE_URL = "http://localhost:8000/chat";

export const getUsersInRoom = async (roomId: string) => {
  const response = await axios.get(`${API_BASE_URL}/users`, { params: { room_id: roomId } });
  return response.data;
};

export const getMessages = async (roomId: string) => {
  const response = await axios.get(`${API_BASE_URL}/messages`, { params: { room_id: roomId } });
  return response.data;
};

export const createRoom = async (roomId: string, user: string) => {
  const response = await axios.post(`${API_BASE_URL}/create`, { room_id: roomId, user });
  return response.data;
};


export const leaveRoom = async (roomId: string, user: string) => {
  const response = await axios.post(`${API_BASE_URL}/leave`, { room_id: roomId, user });
  return response.data;
};

interface Message {
  timestamp: number,
  message: string,
  author: string
}

interface MessageProp {
  timestamp: number,
  message: string,
  author: string,
  room_id: string
}

const Chat: React.FC = () => {
  const { username } = useAuth();

  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [joinInput, setJoinInput] = useState<string>('');
  const [createInput, setCreateInput] = useState<string>('');

  const createModal = useDisclosure();
  const joinModal = useDisclosure();
  const toast = useToast();

  const { sendMessage, lastMessage } = useWebSocket(
    `ws://localhost:8000/chat/ws?room_id=${selectedRoom}&author=${username}`,
    {
      shouldReconnect: () => true, // Reconnect on disconnect
    }
  );

  useEffect(() => {
    if (lastMessage) {
      const regex = /^(.+?) \((.+?)\): (.+)$/;
      const match = lastMessage.data.match(regex);
      setMessages((prev) => [...prev, {author: match[1], timestamp: match[2], message: match[3]}]);
    }
  }, [lastMessage]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}?user=${username}`);
        setRooms(response.data);
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
      }
    };
    fetchChatRooms();
  }, [username]);

  const handleSendMessage = () => {
    sendMessage(messageInput);
    setMessageInput('');
  };

  const handleCreateRoom = async () => {
    try {
      await axios.post(`${API_BASE_URL}/create`, { room_id: createInput, user: username });
      rooms.push(createInput)
      toast({
        title: "Room Created Successfully",
        description: `You successfully created room ${createInput}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setCreateInput('')
      createModal.onClose()
      // broadcast that user joined the room to the room
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      await axios.post(`${API_BASE_URL}/join`, { room_id: joinInput, user: username });
      rooms.push(joinInput)
      toast({
        title: "Joined room Successfully",
        description: `You successfully joined room ${joinInput}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setJoinInput('')
      joinModal.onClose()
      // broadcast that user joined the room to the room
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleGetChatMessages = async (room: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages`, { params: { room_id: room } });
      const newMessages = response.data.map((msg: MessageProp) => {
        const {room_id, ...otherFields} = msg;
        void room_id
        return otherFields;
      });
      setMessages(newMessages);
      console.log(newMessages)
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSelectRoom = async (room: string) => {
    setSelectedRoom(room);
    handleGetChatMessages(room);
  }

  return (
    <Box  h="90vh" display="flex" flexDirection="column" pt="10">
      <Grid templateColumns="repeat(10, 1fr)">
        <GridItem colSpan={3} pl={10}>
          <Box w="100%" h="82vh" border="1px solid" borderColor="gray.200" borderRadius="md" p={2}>
            <HStack w="100%" pb={2}>
              <Heading p={3} size="md" fontWeight="normal">Chats</Heading>
              <Box>
                <Button colorScheme="blue" onClick={createModal.onOpen}>
                  Create Chat
                </Button>
                <Modal isOpen={createModal.isOpen} onClose={createModal.onClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Create a Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <Input
                        value={createInput}
                        onChange={(e) => setCreateInput(e.target.value)}
                        placeholder="Enter chat name:"
                      />
                    </ModalBody>
                    <ModalFooter>
                      <Button mr={3} onClick={createModal.onClose}>
                        Close
                      </Button>
                      <Button colorScheme="blue" onClick={handleCreateRoom}>Create</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </Box>
              <Box>
                <Button colorScheme="blue" onClick={joinModal.onOpen}>
                  Join Chat
                </Button>
                <Modal isOpen={joinModal.isOpen} onClose={joinModal.onClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Join a Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <Input
                          value={joinInput}
                          onChange={(e) => setJoinInput(e.target.value)}
                          placeholder="Enter chat name:"
                        />
                    </ModalBody>
                    <ModalFooter>
                      <Button mr={3} onClick={joinModal.onClose}>
                        Close
                      </Button>
                      <Button colorScheme="blue" onClick={handleJoinRoom}>Join</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </Box>
            </HStack>
            <HStack w="100%" pb={5}>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for your chats..."
              />
            </HStack>
            <Box overflowY="scroll" w="100%">
              {rooms.map((room, index) => {
                if (searchInput) {
                  if (room.includes(searchInput)) {
                    return (
                      <Box
                        key={index}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => handleSelectRoom(room)}
                      >
                        <Text p={5} fontSize="md">
                          {room}
                        </Text>
                      </Box>
                    )
                  }
                } else {
                  return (
                    <Box
                      key={index}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      background={selectedRoom == room ? "gray.200" : "bg"}
                      cursor="pointer"
                      onClick={() => handleSelectRoom(room)}
                    >
                      <Text p={5} fontSize="md">
                        {room}
                      </Text>
                    </Box>
                  )
                }
              })}
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan={7} pr={10}>
          <Box
            w="100%"
            h="82vh"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={2}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Box overflowY="scroll">
              {messages.map((msg, index) => (
                <Box>
                  <Text color="gray.500" fontSize="xs">{new Date(msg.timestamp * 1000).toLocaleString()}</Text>
                  <Box
                    key={index}
                    borderRadius="md"
                    background={msg.author == username ? "gray.200" : "blue.700"}
                    cursor="pointer"
                  >
                    <Text p={5} fontSize="md" color={msg.author == username ? "black" : "white"}>
                      {msg.message}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
            <HStack w="100%" py={3} px={24}>
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleEnterPress}
                placeholder="Type your message..."
              />
              <Button isDisabled={!messageInput} onClick={handleSendMessage} colorScheme="blue">Send</Button>
            </HStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Chat;
