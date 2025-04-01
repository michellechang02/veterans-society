import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  HStack,
  Input,
  Text,
  Heading,
  useDisclosure,
  useToast,
  Flex,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Center,
  Avatar,
  useColorModeValue
} from '@chakra-ui/react';
import { Plus, Send, LogIn, Search, Users, LogOut, MessageCircle } from 'react-feather';
import useWebSocket from 'react-use-websocket';
import { useAuth } from '../Auth/Auth';
import { putJoinRoomData, putLeaveRoomData } from '../Api/putData';
import { getChatRoomsData, getChatMessagesData, getChatRoomMembersData } from '../Api/getData';
import { postChatCreateRoomData } from '../Api/postData'
import ChatModal from './ChatModal'

interface Message {
  timestamp: number,
  message: string,
  author: string
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
  const [allMembers, setAllMembers] = useState<string[]>([])
  const [isSending, setIsSending] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createModal = useDisclosure();
  const joinModal = useDisclosure();
  const leaveModal = useDisclosure();
  const toast = useToast();
  const viewMembersDrawer = useDisclosure();

  const { sendMessage, lastMessage } = useWebSocket(
    `ws://localhost:8000/chat/ws?room_id=${selectedRoom}&author=${username}`,
    {
      shouldReconnect: () => true, // Reconnect on disconnect
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (lastMessage) {
      const data = lastMessage.data;
      // Match messages and notifications using regex
      const regex = /^(.+?) \((.+?)\): (.+)$/;
      const match = data.match(regex);

      if (match) {
        const author = match[1];
        const timestamp = new Date(match[2]).getTime() / 1000;
        const message = match[3];

        setMessages((prev) => [
          ...prev,
          { author, timestamp, message },
        ]);
      }
      setIsSending(false);
    }
  }, [lastMessage]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await getChatRoomsData(username);
        setRooms(response);
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
        const description = error instanceof Error ? error.message : "A problem occurred while loading chat rooms";
        toast({
          title: "Failed to load chat rooms",
          description: description,
          status: "error",
          duration: 2500,
          isClosable: true,
        });
      }
    };
    fetchChatRooms();
  }, [toast, username]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setIsSending(true);
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleCreateRoom = async () => {
    let title = "Room Created Successfully";
    let description = `You successfully created room ${createInput}`;
    let status = true;
    try {
      await postChatCreateRoomData(createInput, username);
      rooms.push(createInput)
    } catch (error) {
      if (error instanceof Error) {
        description = error.message
      } else {
        description = "An unknown error occurred"
      }
      title = `Failed to join room ${joinInput}`;
      status = false;
    } finally {
      createModal.onClose()
      toast({
        title: title,
        description: description,
        status: status ? "success" : "error",
        duration: 2500,
        isClosable: true,
      });
      setCreateInput('')
    }
  };

  const handleJoinRoom = async () => {
    let title = "Joined room Successfully";
    let description = `You successfully joined room ${joinInput}`;
    let status = true;
    try {
      await putJoinRoomData(joinInput, username)
      rooms.push(joinInput)
    } catch (error) {
      if (error instanceof Error) {
        description = error.message
      } else {
        description = "An unknown error occurred"
      }
      title = `Failed to join room ${joinInput}`;
      status = false
    } finally {
      joinModal.onClose()
      toast({
        title: title,
        description: description,
        status: status ? "success" : "error",
        duration: 2500,
        isClosable: true,
      });
      setJoinInput('')
    }
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleGetChatMessages = async (room: string) => {
    try {
      const response = await getChatMessagesData(room);
      setMessages(response);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([])
      const description = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title:  `Failed to fetch messages for room ${room}`,
        description: description,
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const handleSelectRoom = async (room: string) => {
    setSelectedRoom(room);
    handleGetChatMessages(room);
  }

  const handleLeaveRoom = async () => {
    let title = "Left room";
    let description = `You left room ${joinInput}`;
    let status = true;
    try {
      await putLeaveRoomData(selectedRoom, username);
      const updatedRooms = rooms.filter((room) => room !== selectedRoom);
      setRooms(updatedRooms);
    } catch (error) {
      if (error instanceof Error) {
        description = error.message
      } else {
        description = "An unknown error occurred"
      }
      title = `Failed to left room ${joinInput}`;
      status = false
    } finally {
      leaveModal.onClose();
      toast({
        title: title,
        description: description,
        status: status ? "warning" : "error",
        duration: 2500,
        isClosable: true,
      });
      setSelectedRoom('');
    }
  }

  const handleViewAllMembers = async () => {
    try {
      const response = await getChatRoomMembersData(selectedRoom);
      setAllMembers(response);
      viewMembersDrawer.onOpen()
    } catch (error) {
      console.error("Failed to fetch all members:", error);
      setAllMembers([])
      const description = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title:  `Failed to fetch members for room ${selectedRoom}`,
        description: description,
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  }

  // Add color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const chatAreaBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const lightBorderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('black', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const selectedBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const ownMessageBg = useColorModeValue('gray.500', 'blue.500');
  const otherMessageBg = useColorModeValue('white', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const systemMessageBg = useColorModeValue('gray.100', 'gray.600');

  return (
    <Box h="calc(100vh - 40px)" display="flex" flexDirection="column" pt={4}>
      <Flex h="full">
        {/* Chat Rooms Sidebar */}
        <Box 
          w="300px" 
          h="full" 
          bg={bgColor} 
          borderRight="1px" 
          borderColor={borderColor}
          shadow="sm"
          mr={4}
          borderRadius="lg"
          overflow="hidden"
        >
          <Box p={4} borderBottom="1px" borderColor={lightBorderColor}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md" fontWeight="bold" color={textColor}>Chats</Heading>
              <HStack spacing={2}>
                <IconButton 
                  aria-label="Create Chat" 
                  icon={<Plus size={18} />} 
                  colorScheme="gray"
                  size="sm"
                  onClick={createModal.onOpen}
                />
                <IconButton 
                  aria-label="Join Chat" 
                  icon={<LogIn size={18} />} 
                  colorScheme="gray"
                  size="sm"
                  onClick={joinModal.onOpen}
                />
              </HStack>
            </Flex>
            
            <HStack mb={4}>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search chats..."
                size="md"
                borderRadius="md"
                bg={inputBg}
                color={textColor}
                _focus={{ borderColor: "gray.500", boxShadow: "0 0 0 1px gray.500" }}
              />
              <IconButton
                aria-label="Search"
                icon={<Search size={18} />}
                colorScheme="gray"
                size="md"
              />
            </HStack>
          </Box>
          
          <Box 
            overflowY="auto" 
            h="calc(100% - 140px)" 
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: useColorModeValue('gray.200', 'gray.600'),
                borderRadius: '24px',
              },
            }}
          >
            {rooms
              .filter((room) => !searchInput || room.includes(searchInput))
              .map((room, index) => (
                <Box
                  key={index}
                  p={3}
                  m={2}
                  borderRadius="md"
                  bg={selectedRoom === room ? selectedBg : bgColor}
                  borderLeft={selectedRoom === room ? "4px solid" : "none"}
                  borderLeftColor="gray.500"
                  cursor="pointer"
                  _hover={{ bg: selectedRoom === room ? selectedBg : hoverBg }}
                  onClick={() => handleSelectRoom(room)}
                  transition="all 0.2s"
                >
                  <Text fontSize="md" fontWeight={selectedRoom === room ? "bold" : "medium"} color={textColor}>
                    {room}
                  </Text>
                </Box>
              ))}
          </Box>
        </Box>

        {/* Chat Area */}
        <Box
          flex="1"
          h="full"
          bg={bgColor}
          shadow="sm"
          borderRadius="lg"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <Flex 
                justify="space-between" 
                align="center" 
                p={4} 
                borderBottom="1px" 
                borderColor={borderColor}
                bg={bgColor}
              >
                <Heading size="md" fontWeight="bold" color={textColor}>{selectedRoom}</Heading>
                <HStack>
                  <IconButton 
                    aria-label='View Members' 
                    icon={<Users size={18} />}
                    colorScheme="gray"
                    variant="ghost"
                    onClick={handleViewAllMembers}
                    size="md"
                  />
                  <IconButton 
                    aria-label='Leave Chat' 
                    icon={<LogOut size={18} />}
                    colorScheme="gray"
                    variant="ghost"
                    onClick={leaveModal.onOpen}
                    size="md"
                  />
                </HStack>
              </Flex>

              {/* Messages Area */}
              <Box 
                flex="1" 
                overflowY="auto" 
                p={4} 
                bg={chatAreaBg}
                css={{
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: useColorModeValue('gray.200', 'gray.600'),
                    borderRadius: '24px',
                  },
                }}
              >
                {messages.map((msg, index) => {
                  if (msg.author === "System") {
                    return (
                      <Center key={index} my={2}>
                        <Text 
                          fontSize="xs" 
                          color={subTextColor} 
                          bg={systemMessageBg} 
                          px={3} 
                          py={1} 
                          borderRadius="full"
                        >
                          {new Date(msg.timestamp * 1000).toLocaleString()} {msg.message}
                        </Text>
                      </Center>
                    );
                  } else {
                    const isOwnMessage = msg.author === username;
                    return (
                      <Flex
                        key={index}
                        justify={isOwnMessage ? "flex-end" : "flex-start"}
                        mb={4}
                      >
                        <Box maxW="70%">
                          {!isOwnMessage && (
                            <Text color={subTextColor} fontSize="xs" fontWeight="bold" mb={1} ml={1}>
                              {msg.author}
                            </Text>
                          )}
                          <Box
                            bg={isOwnMessage ? ownMessageBg : otherMessageBg}
                            color={isOwnMessage ? "white" : textColor}
                            p={3}
                            borderRadius="lg"
                            boxShadow="sm"
                            borderTopLeftRadius={!isOwnMessage ? "0" : undefined}
                            borderTopRightRadius={isOwnMessage ? "0" : undefined}
                          >
                            <Text fontSize="md">{msg.message}</Text>
                          </Box>
                          <Text color={subTextColor} fontSize="xs" mt={1} textAlign={isOwnMessage ? "right" : "left"}>
                            {new Date(msg.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </Text>
                        </Box>
                      </Flex>
                    );
                  }
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box p={4} bg={bgColor} borderTop="1px" borderColor={borderColor}>
                <HStack>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleEnterPress}
                    placeholder="Type your message..."
                    isDisabled={isSending}
                    size="md"
                    bg={inputBg}
                    color={textColor}
                    borderRadius="full"
                    _focus={{ borderColor: "gray.500", boxShadow: "0 0 0 1px gray.500" }}
                  />
                  <IconButton 
                    aria-label="Send message" 
                    icon={<Send size={18}/>} 
                    isDisabled={!messageInput || isSending} 
                    onClick={handleSendMessage} 
                    colorScheme="gray"
                    isLoading={isSending}
                    borderRadius="full"
                  />
                </HStack>
              </Box>
            </>
          ) : (
            <Center h="full" flexDirection="column" p={8}>
              <Box 
                mb={4} 
                p={6} 
                borderRadius="full" 
                bg={useColorModeValue('gray.100', 'gray.700')} 
                color={subTextColor}
              >
                <MessageCircle size={48} />
              </Box>
              <Heading size="md" color={subTextColor} mb={2}>No chat selected</Heading>
              <Text color={subTextColor} textAlign="center">
                Select a chat room from the sidebar or create a new one to start messaging
              </Text>
            </Center>
          )}
        </Box>
      </Flex>

      {/* Keep all modals at their current position */}
      <ChatModal
        modalTitle="Create a Chat"
        placeholder="Enter chat name"
        buttonText="Create Chat"
        inputValue={createInput}
        setInputValue={setCreateInput}
        onSubmit={handleCreateRoom}
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
      />
      
      <ChatModal
        modalTitle="Join a Chat"
        placeholder="Enter chat name"
        buttonText="Join Chat"
        inputValue={joinInput}
        setInputValue={setJoinInput}
        onSubmit={handleJoinRoom}
        isOpen={joinModal.isOpen}
        onClose={joinModal.onClose}
      />
      
      <ChatModal
        modalTitle="Leave chat"
        buttonText="Leave Chat"
        confirmationMessage={`Are you sure you want to leave ${selectedRoom}?`}
        onSubmit={handleLeaveRoom}
        isDanger
        isOpen={leaveModal.isOpen}
        onClose={leaveModal.onClose}
      />

      <Drawer
        isOpen={viewMembersDrawer.isOpen}
        placement="right"
        onClose={viewMembersDrawer.onClose}
      >
        <DrawerOverlay />
        <DrawerContent bg={bgColor} color={textColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>Members in {selectedRoom}</DrawerHeader>
          <DrawerBody>
            {allMembers.length > 0 ? (
              allMembers.map((member, index) => (
                <Flex
                  key={index}
                  align="center"
                  p={3}
                  m={1}
                  borderRadius="md"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderLeft="3px solid"
                  borderLeftColor={member === username ? "gray.500" : "gray.300"}
                >
                  <Avatar size="sm" name={member} mr={3} />
                  <Text fontWeight={member === username ? "bold" : "normal"}>
                    {member} {member === username && "(You)"}
                  </Text>
                </Flex>
              ))
            ) : (
              <Center h="100%" flexDirection="column">
                <Text color={subTextColor}>No members found</Text>
              </Center>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Chat;
