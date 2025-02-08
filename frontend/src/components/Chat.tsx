import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  Input,
  Button,
  Text,
  Grid,
  GridItem,
  Heading,
  useDisclosure,
  useToast,
  Divider,
  Flex,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Center
} from '@chakra-ui/react';
import { MdOutlinePeopleAlt } from "react-icons/md";
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
    sendMessage(messageInput);
    setMessageInput('');
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

  return (
    <Box  h="90vh" display="flex" flexDirection="column" pt="10">
      <Grid templateColumns="repeat(10, 1fr)">
        <GridItem colSpan={3} pl={10}>
          <Box w="100%" h="82vh" shadow="md" p={2}>
            <HStack w="100%" pb={2}>
              <Heading p={3} size="md" fontWeight="bold">Chats</Heading>
              <Button bgColor="gray.500" color="white" onClick={createModal.onOpen}>
                Create Chat
              </Button>
              <ChatModal
                modalTitle="Create a Chat"
                placeholder="Enter chat name:"
                buttonText="Create Chat"
                inputValue={createInput}
                setInputValue={setCreateInput}
                onSubmit={handleCreateRoom}
                isOpen={createModal.isOpen}
                onClose={createModal.onClose}
              />
              <Button bgColor="gray.500" color="white" onClick={joinModal.onOpen}>
                Join Chat
              </Button>
              <ChatModal
                modalTitle="Join a Chat"
                placeholder="Enter chat name:"
                buttonText="Join Chat"
                inputValue={joinInput}
                setInputValue={setJoinInput}
                onSubmit={handleJoinRoom}
                isOpen={joinModal.isOpen}
                onClose={joinModal.onClose}
              />
            </HStack>
            <HStack w="100%" pb={5}>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for your chats..."
              />
            </HStack>
            <Box overflowY="scroll" w="100%">
              {rooms
                .filter((room) => !searchInput || room.includes(searchInput)) // Filter rooms based on searchInput
                .map((room, index) => (
                  <Box
                    key={index}
                    borderColor="gray.200"
                    background={selectedRoom === room ? "gray.200" : "bg"}
                    cursor="pointer"
                    onClick={() => handleSelectRoom(room)}
                  >
                    <Text p={5} fontSize="md" fontWeight="bold">
                      {room}
                    </Text>
                  </Box>
                ))}
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan={7} pr={10}>
          <Box
            w="100%"
            h="82vh"
            ml={4}
            shadow="md"
            p={2}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <HStack display="flex" justifyContent="space-between" p={1}>
              <Heading size="md" fontWeight="bold">{selectedRoom}</Heading>
              <Box>
                <IconButton aria-label='members' mr={2} onClick={handleViewAllMembers}>
                  <MdOutlinePeopleAlt />
                </IconButton>
                <Button onClick={leaveModal.onOpen}>Leave</Button>
              </Box>
              <ChatModal
                modalTitle="Leave chat"
                buttonText="Leave Chat"
                confirmationMessage={`Are you sure you want to leave ${selectedRoom}?`}
                onSubmit={handleLeaveRoom}
                isDanger
                isOpen={leaveModal.isOpen}
                onClose={leaveModal.onClose}
              />
            </HStack>
            <Drawer
              isOpen={viewMembersDrawer.isOpen}
              placement="right"
              onClose={viewMembersDrawer.onClose}
            >
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>All Members</DrawerHeader>
                <DrawerBody>
                  {allMembers.map((member, index) =>
                    <Box
                      key={index}
                      border="1px solid"
                      borderColor="gray.200"
                      p={3}
                      m={1}
                    >
                      {member}
                    </Box>
                  )}
                </DrawerBody>
              </DrawerContent>
            </Drawer>
            <Divider />
            <Box overflowY="scroll" pt={2} flex="1">
              {messages.map((msg, index) => {
                if (msg.author == "System") {
                  return <Center color="gray.700">{new Date(msg.timestamp * 1000).toLocaleString()} {msg.message}</Center>
                } else {
                  return (
                    <Flex
                      key={index}
                      justify={msg.author === username ? "flex-end" : "flex-start"}
                      mb={2}
                      mx={6}
                    >
                      <Box key={index}>
                        <Text color="gray.600" fontSize="xs">{msg.author}</Text>
                        <Text color="gray.500" fontSize="xs">{new Date(msg.timestamp * 1000).toLocaleString()}</Text>
                        <Box
                          background={msg.author === "System" ? "gray.300" : msg.author === username ? "blue.700" : "gray.200"}
                          color={msg.author === "System" ? "black" : msg.author === username ? "white" : "black"}
                          p={4}
                          maxWidth="25vw"
                          borderRadius="lg"
                        >
                          <Text>{msg.message}</Text>
                        </Box>
                      </Box>
                    </Flex>
                  )
                }
              }
              )}
            </Box>
            <HStack w="100%" py={3} px={24}>
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleEnterPress}
                placeholder="Type your message..."
              />
              <Button isDisabled={!messageInput} onClick={handleSendMessage} bgColor="gray.500" color="white" >Send</Button>
            </HStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Chat;
