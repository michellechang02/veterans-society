import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Input, Button, Text, Grid, GridItem, Center, Heading } from '@chakra-ui/react';
import useWebSocket from 'react-use-websocket';
import axios from 'axios';

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


interface ChatProps {
  roomId: string;
  user: string;
}

interface MessageProps {
  roomId: string,
  timestamp: number,
  message: string,
  author: string
}

const Chat: React.FC<ChatProps> = ({ roomId, user }) => {
  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const { sendMessage, lastMessage } = useWebSocket(
    `ws://localhost:8000/chat/ws?room_id=${roomId}&author=${user}`,
    {
      shouldReconnect: () => true, // Reconnect on disconnect
    }
  );

  useEffect(() => {
    if (lastMessage) {
      setMessages((prev) => [...prev, lastMessage.data]);
    }
  }, [lastMessage]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}?user=${user}`);
        setRooms(response.data);
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
      }
    };
    fetchChatRooms();
  }, [user]);

  const handleSendMessage = () => {
    sendMessage(messageInput);
    setMessageInput('');
  };

  const handleJoinRoom = async () => {
    try {
      await axios.post(`${API_BASE_URL}/join`, { room_id: roomId, user });
      // broadcast that user joined the room to the room
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const handleGetChatMessages = async () => {
    try {
      const response = await axios.get(`/chat/messages?room_id=${roomId}`);
      setMessages(response.data.messages.map((m: MessageProps) => `${m.author}: ${m.message}`));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  return (
    <Box  h="90vh" display="flex" flexDirection="column" pt="10">
      <Grid templateColumns="repeat(10, 1fr)">
        <GridItem colSpan={3} pl={10}>
          <Box w="100%" h="75vh" overflowY="scroll" border="1px solid gray" p={2}>
            <Heading p={3} size="md" fontWeight="normal">Chats</Heading>
            <HStack w="100%">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for a chat to join..."
              />
              <Button isDisabled={!searchInput} onClick={handleSendMessage}>Search</Button>
            </HStack>
            {rooms.map((room, index) => {
              if (searchInput) {
                if (room == searchInput) {
                  return (<Text key={index}>{room}</Text>)
                }
              } else {
                return <Text key={index}>{room}</Text>
              }
            })}
          </Box>
        </GridItem>
        <GridItem colSpan={7} pr={10}>
          <VStack spacing={4}>
            <Box w="100%" h="75vh" overflowY="scroll" border="1px solid gray" p={2}>
              {messages.map((msg, index) => (
                <Text key={index}>{msg}</Text>
              ))}
            </Box>
            <HStack w="100%">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
              />
              <Button isDisabled={!messageInput} onClick={handleSendMessage} colorScheme="blue">Send</Button>
            </HStack>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Chat;
