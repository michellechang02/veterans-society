import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabPanels,
  TabPanel,
  Input,
  Button,
  Select,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Avatar,
  Flex,
  Badge,
  VStack,
  HStack,
  Divider,
  IconButton,
  InputGroup,
  InputLeftElement,
  Grid
} from '@chakra-ui/react';
import { useAuth } from '../../Auth/Auth';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, MapPin, Briefcase, Heart, Activity, UserX, User, Mail, Phone, Shield, Filter } from 'react-feather';

// You'll need to create or modify these API functions
import { getAllUsers } from '../../Api/getData';
import { updateUserData } from '../../Api/putData';
import { deleteUser } from '../../Api/deleteData';

interface UserData {
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  interests?: string[];
  employmentStatus?: string;
  workLocation?: string;
  liveLocation?: string;
  isVeteran?: boolean;
  height?: number | string;
  weight?: number | string;
  fullName?: string;
  profilePic?: string;
  phone?: string;
}

interface EditFormData {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  phoneNumber: string;
  interests: string[];
  employmentStatus: string;
  workLocation: string;
  liveLocation: string;
  isVeteran: boolean;
  height: string;
  weight: string;
}

interface UpdateUserDataParams {
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
  interests?: string[];
  employmentStatus?: string;
  workLocation?: string;
  liveLocation?: string;
  isVeteran?: boolean;
  weight?: number;
  height?: number;
  profilePic?: File;
}

const Dashboard: React.FC = () => {
  const { username, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    password: '',
    email: '',
    phoneNumber: '',
    interests: [] as string[],
    employmentStatus: '',
    workLocation: '',
    liveLocation: '',
    isVeteran: true,
    height: '',
    weight: '',
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [editableField, setEditableField] = useState<string | null>(null);

  // Check if user is admin, if not redirect
  useEffect(() => {
    if (!username || isAdmin === false) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    }
  }, [username, isAdmin, navigate, toast]);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: "Failed to load users data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchUsers();
  }, [toast]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle edit user
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '', // Usually left blank unless changing
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      interests: user.interests || [], // Ensure this is an array
      employmentStatus: user.employmentStatus || '',
      workLocation: user.workLocation || '',
      liveLocation: user.liveLocation || '',
      isVeteran: user.isVeteran !== undefined ? user.isVeteran : true,
      height: user.height !== undefined ? user.height.toString() : '',
      weight: user.weight !== undefined ? user.weight.toString() : '',
    });
  };

  // Handle delete user confirmation
  const handleDeleteClick = (user: UserData) => {
    setSelectedUser(user);
    onOpen();
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === 'isVeteran' ? value === 'true' : value
    });
  };

  // Handle editable field
  const handleEditField = (fieldName: string) => {
    setEditableField(fieldName);
  };

  // Save field after editing
  const handleSaveField = async (fieldName: string) => {
    if (!selectedUser) return;

    try {
      const dataToSend: Partial<UpdateUserDataParams> = {};

      // Only update the specific field
      if (fieldName === 'interests') {
        // Convert array to the expected format
        dataToSend.interests = editFormData.interests;
      } else if (fieldName === 'height') {
        // Validate and convert to number
        const heightVal = parseInt(editFormData.height);
        if (isNaN(heightVal)) {
          throw new Error("Height must be a valid number");
        }
        dataToSend.height = heightVal;
      } else if (fieldName === 'weight') {
        // Validate and convert to number
        const weightVal = parseInt(editFormData.weight);
        if (isNaN(weightVal)) {
          throw new Error("Weight must be a valid number");
        }
        dataToSend.weight = weightVal;
      } else if (fieldName === 'isVeteran') {
        dataToSend.isVeteran = editFormData.isVeteran;
      } else {
        // Use type assertion to fix the compatibility issue
        (dataToSend as any)[fieldName] =
          editFormData[fieldName as keyof EditFormData];
      }

      await updateUserData(selectedUser.username, dataToSend);

      // Update local state
      const updatedUserData: UserData = {
        ...selectedUser
      };

      // Apply updates to the local user object
      if (fieldName === 'interests') {
        updatedUserData.interests = dataToSend.interests;
      } else if (fieldName === 'height') {
        updatedUserData.height = dataToSend.height;
      } else if (fieldName === 'weight') {
        updatedUserData.weight = dataToSend.weight;
      } else if (fieldName === 'isVeteran') {
        updatedUserData.isVeteran = dataToSend.isVeteran;
      } else if (dataToSend[fieldName as keyof UpdateUserDataParams] !== undefined) {
        (updatedUserData as any)[fieldName] = dataToSend[fieldName as keyof UpdateUserDataParams];
      }

      setUsers(users.map(user =>
        user.username === selectedUser.username
          ? updatedUserData
          : user
      ));

      setSelectedUser(updatedUserData);
      setEditableField(null);

      toast({
        title: "Success",
        description: "Field updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to update field:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update field.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };


  // Delete user
  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.username);

      // Update local state
      setUsers(users.filter(user => user.username !== selectedUser.username));

      // Add this line to ensure we return to the user list view
      setSelectedUser(null);

      onClose();
      toast({
        title: "Success",
        description: "User has been removed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error",
        description: "Failed to remove user.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Render editable field
  const renderField = (fieldName: string, label: string, value: any, icon?: JSX.Element) => {
    return (
      <Flex direction="row" align="center" p={3} borderRadius="md" bgColor="gray.50" _hover={{ bgColor: "gray.100" }} w="100%">
        {icon && <Box mr={3} color="gray.500">{icon}</Box>}
        <Box flex="1">
          <Text fontWeight="bold" fontSize="sm" color="gray.600">{label}</Text>
          {editableField === fieldName ? (
            <Flex mt={1}>
              {fieldName === 'interests' ? (
                <Input
                  value={Array.isArray(editFormData.interests) ? editFormData.interests.join(', ') : editFormData.interests}
                  onChange={(e) => {
                    const interestsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                    setEditFormData({
                      ...editFormData,
                      interests: interestsArray
                    });
                  }}
                  placeholder="Enter interests separated by commas"
                  size="sm"
                  bgColor="white"
                  borderColor="gray.300"
                />
              ) : fieldName === 'isVeteran' ? (
                <Select
                  value={editFormData.isVeteran.toString()}
                  onChange={(e) => {
                    setEditFormData({
                      ...editFormData,
                      isVeteran: e.target.value === 'true'
                    });
                  }}
                  size="sm"
                  bgColor="white"
                  borderColor="gray.300"
                >
                  <option value="true">Veteran</option>
                  <option value="false">Admin</option>
                </Select>
              ) : (
                <Input
                  name={fieldName}
                  value={String(editFormData[fieldName as keyof EditFormData])}
                  onChange={handleInputChange}
                  size="sm"
                  type={fieldName === 'password' ? 'password' : 'text'}
                  bgColor="white"
                  borderColor="gray.300"
                />
              )}
              <Button
                size="sm"
                ml={2}
                bgColor="gray.500"
                color="white"
                onClick={() => handleSaveField(fieldName)}
              >
                Save
              </Button>
              <Button
                size="sm"
                ml={2}
                variant="outline"
                onClick={() => setEditableField(null)}
              >
                Cancel
              </Button>
            </Flex>
          ) : (
            <Flex align="center">
              <Text color="gray.600">
                {fieldName === 'interests' && Array.isArray(value)
                  ? value.join(', ')
                  : fieldName === 'isVeteran'
                    ? value ? 'Veteran' : 'Admin'
                    : fieldName === 'password'
                      ? '••••••••'
                      : value || 'Not provided'}
              </Text>
              <IconButton
                aria-label={`Edit ${label}`}
                icon={<Edit size={16} />}
                size="xs"
                ml={2}
                variant="ghost"
                onClick={() => handleEditField(fieldName)}
              />
            </Flex>
          )}
        </Box>
      </Flex>
    );
  };

  return (
    <Container maxW="container.xl" pt={10} bg="white">
      <Box mb={2} textAlign="center">
        <Heading size="lg" mb={2} color="black">Admin Dashboard</Heading>
        <Text color="gray.500">Manage veterans</Text>
      </Box>

      <Tabs variant="enclosed" colorScheme="blackAlpha">

        <TabPanels>
          <TabPanel bg="white" shadow="sm" borderRadius="md" borderTopLeftRadius="0">
            <Box>
              <Flex mb={6} justify="space-between" align="center">
                <Flex align="center" maxW={{ base: "100%", md: "350px" }} w="100%">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Search size={18} color="black" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      borderColor="gray.300"
                      _focus={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                    />
                  </InputGroup>
                  <IconButton
                    aria-label="Filter results"
                    icon={<Filter size={18} />}
                    ml={2}
                    bg="white"
                    color="gray.500"
                    borderWidth="1px"
                    borderColor="gray.300"
                    _hover={{ bg: "gray.50" }}
                  />
                </Flex>
                <Text color="gray.500" fontSize="sm">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                </Text>
              </Flex>

              {selectedUser ? (
                <Box
                  bg="white"
                  borderRadius="lg"
                  p={6}
                  boxShadow="md"
                  borderColor="gray.200"
                  borderWidth="1px"
                  mb={8}
                >
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" color="black">Edit User: {selectedUser.username}</Heading>
                    <Button
                      onClick={() => setSelectedUser(null)}
                      variant="outline"
                      borderColor="gray.300"
                      color="gray.500"
                      size="sm"
                      _hover={{ bg: "gray.50" }}
                    >
                      Back to List
                    </Button>
                  </Flex>

                  <Divider mb={4} />

                  <VStack spacing={4} align="stretch" divider={<Divider />}>
                    {/* Group name fields side by side */}
                    <HStack spacing={4} flexDir={{ base: "column", sm: "row" }} w="100%">
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("firstName", "First Name", editFormData.firstName)}
                      </Box>
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("lastName", "Last Name", editFormData.lastName)}
                      </Box>
                    </HStack>

                    {/* Group contact information side by side */}
                    <HStack spacing={4} flexDir={{ base: "column", sm: "row" }} w="100%">
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("email", "Email", editFormData.email)}
                      </Box>
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("phoneNumber", "Phone Number", editFormData.phoneNumber)}
                      </Box>
                    </HStack>

                    {/* Password field on its own */}
                    {renderField("password", "Password", editFormData.password ? "••••••••" : "")}

                    {/* Interests field on its own */}
                    {renderField("interests", "Interests", editFormData.interests, <Heart size={20} />)}

                    {/* Group employment information */}
                    <HStack spacing={4} flexDir={{ base: "column", sm: "row" }} w="100%">
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("employmentStatus", "Employment Status", editFormData.employmentStatus, <Briefcase size={20} />)}
                      </Box>
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("isVeteran", "User Type", editFormData.isVeteran)}
                      </Box>
                    </HStack>

                    {/* Group location fields side by side */}
                    <HStack spacing={4} flexDir={{ base: "column", sm: "row" }} w="100%">
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("workLocation", "Work Location", editFormData.workLocation, <MapPin size={20} />)}
                      </Box>
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("liveLocation", "Live Location", editFormData.liveLocation, <MapPin size={20} />)}
                      </Box>
                    </HStack>

                    {/* Group physical attributes side by side */}
                    <HStack spacing={4} flexDir={{ base: "column", sm: "row" }} w="100%">
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("height", "Height", editFormData.height, <Activity size={20} />)}
                      </Box>
                      <Box w={{ base: "100%", sm: "50%" }}>
                        {renderField("weight", "Weight", editFormData.weight, <Activity size={20} />)}
                      </Box>
                    </HStack>
                  </VStack>


                </Box>
              ) : (
                <Box>
                  <Box
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <Box
                          key={user.username}
                          p={5}
                          bg="white"
                          borderBottomWidth={index < filteredUsers.length - 1 ? "1px" : "0"}
                          borderBottomColor="gray.100"
                          _hover={{ bg: "gray.50" }}
                          transition="background 0.2s"
                        >
                          <Flex direction="column" width="100%">
                            {/* Header with Avatar and Username */}
                            <Flex align="center" mb={4}>
                              <Avatar
                                size="md"
                                name={user.fullName || user.username}
                                src={user.profilePic}
                                bg="gray.200"
                                icon={<User size={22} />}
                              />
                              <Box ml={4}>
                                <Flex align="center">
                                  <Text fontWeight="bold" fontSize="lg" color="black">
                                    {user.username}
                                  </Text>
                                  <Badge
                                    bg={user.isVeteran ? "gray.700" : "black"}
                                    color="white"
                                    fontSize="xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    display="flex"
                                    alignItems="center"
                                    ml={4}
                                  >
                                    <Shield size={12} style={{ marginRight: '4px' }} />
                                    {user.isVeteran ? "veteran" : "admin"}
                                  </Badge>
                                </Flex>
                              </Box>
                              {/* Actions */}
                              <Flex ml="auto">
                                <Button
                                  size="sm"
                                  bg="white"
                                  color="black"
                                  borderColor="gray.300"
                                  borderWidth="1px"
                                  mr={2}
                                  _hover={{ bg: "gray.50" }}
                                  leftIcon={<Edit size={14} />}
                                  onClick={() => handleEditUser(user)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  bg="gray.50"
                                  color="black"
                                  borderColor="gray.300"
                                  borderWidth="1px"
                                  _hover={{ bg: "gray.100" }}
                                  leftIcon={<UserX size={14} />}
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  Remove
                                </Button>
                              </Flex>
                            </Flex>

                            {/* User Information Grid */}
                            <Grid
                              templateColumns={{
                                base: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                                lg: "repeat(4, 1fr)"
                              }}
                              gap={4}
                              bg="gray.50"
                              p={4}
                              borderRadius="md"
                            >
                              {/* Personal Info */}
                              <Flex align="center">
                                <Box p={2} borderRadius="md" bg="gray.100" color="gray.500" mr={3}>
                                  <User size={16} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Name</Text>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {user.firstName && user.lastName
                                      ? `${user.firstName} ${user.lastName}`
                                      : user.firstName || user.lastName || "—"}
                                  </Text>
                                </Box>
                              </Flex>

                              {/* Email */}
                              <Flex align="center">
                                <Box p={2} borderRadius="md" bg="gray.100" color="gray.500" mr={3}>
                                  <Mail size={16} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Email</Text>
                                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                    {user.email || "—"}
                                  </Text>
                                </Box>
                              </Flex>

                              {/* Phone */}
                              <Flex align="center">
                                <Box p={2} borderRadius="md" bg="gray.100" color="gray.500" mr={3}>
                                  <Phone size={16} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Phone</Text>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {user.phoneNumber || user.phone || "—"}
                                  </Text>
                                </Box>
                              </Flex>

                              {/* Employment Status */}
                              <Flex align="center">
                                <Box p={2} borderRadius="md" bg="gray.100" color="gray.500" mr={3}>
                                  <Briefcase size={16} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Employment</Text>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {user.employmentStatus || "—"}
                                  </Text>
                                </Box>
                              </Flex>

                              {/* Work Location */}
                              <Flex align="center">
                                <Box p={2} borderRadius="md" bg="gray.100" color="gray.500" mr={3}>
                                  <MapPin size={16} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Work Location</Text>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {user.workLocation || "—"}
                                  </Text>
                                </Box>
                              </Flex>

                              {/* Live Location */}
                              <Flex align="center">
                                <Box p={2} borderRadius="md" bg="gray.100" color="gray.500" mr={3}>
                                  <MapPin size={16} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Home Location</Text>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {user.liveLocation || "—"}
                                  </Text>
                                </Box>
                              </Flex>

                              {/* Height/Weight */}
                              <Flex align="center">
                                <Box p={2} borderRadius="md" bg="gray.100" color="gray.500" mr={3}>
                                  <Activity size={16} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Height/Weight</Text>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {user.height || user.weight
                                      ? `${user.height || "—"} / ${user.weight || "—"}`
                                      : "—"}
                                  </Text>
                                </Box>
                              </Flex>

                              {/* Interests */}
                              <Flex align="center">
                                <Box p={2} borderRadius="md" bg="gray.100" color="gray.500" mr={3}>
                                  <Heart size={16} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Interests</Text>
                                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                    {user.interests && user.interests.length > 0
                                      ? user.interests.join(", ")
                                      : "—"}
                                  </Text>
                                </Box>
                              </Flex>
                            </Grid>
                          </Flex>
                        </Box>
                      ))
                    ) : (
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        py={10}
                        px={4}
                        bg="white"
                        color="gray.500"
                        textAlign="center"
                      >
                        <Search size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <Text mb={1}>No users found matching "{searchTerm}"</Text>
                        <Text fontSize="sm">Try adjusting your search term</Text>
                      </Flex>
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Delete User Confirmation Dialog */}
            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent borderWidth="1px" borderColor="gray.200">
                  <AlertDialogHeader fontSize="lg" fontWeight="bold" color="black">
                    Remove User
                  </AlertDialogHeader>

                  <AlertDialogBody color="gray.500">
                    Are you sure you want to remove {selectedUser?.username}? This action cannot be undone.
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button
                      ref={cancelRef}
                      onClick={onClose}
                      color="gray.500"
                      borderColor="gray.300"
                      borderWidth="1px"
                    >
                      Cancel
                    </Button>
                    <Button
                      bg="black"
                      color="white"
                      onClick={confirmDelete}
                      ml={3}
                      _hover={{ bg: "gray.800" }}
                    >
                      Remove
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Dashboard; 