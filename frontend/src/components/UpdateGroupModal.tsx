import React, { useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Textarea,
  useDisclosure,
  IconButton,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Edit, Trash2 } from "react-feather";

type UpdateGroupModalProps = {
  group: {
    groupId: string;
    name: string;
    description: string;
  };
  onUpdateGroup: (updatedGroup: { groupId: string; name: string; description: string; image: File | null }) => void;
  mutate?: () => void;
};

const UpdateGroupModal: React.FC<UpdateGroupModalProps> = ({ group, onUpdateGroup, mutate }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupName, setGroupName] = useState<string>(group.name);
  const [groupDescription, setGroupDescription] = useState<string>(group.description);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File|null>(null);

  // Color mode values
  const textColor = useColorModeValue("gray.800", "white");
  const buttonBgColor = useColorModeValue("gray.500", "gray.600");
  const buttonHoverBgColor = useColorModeValue("gray.600", "gray.700");
  const modalBgColor = useColorModeValue("white", "gray.800");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const fileDisplayBgColor = useColorModeValue("gray.100", "gray.700");

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
    }
  };

  // Add this function to reset the file input when removing the image
  const handleRemoveImage = () => {
    setImage(null);
    
    // Reset the file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdate = () => {
    onUpdateGroup({
      groupId: group.groupId,
      name: groupName,
      description: groupDescription,
      image: image
    });
    // Trigger SWR refresh if mutate is provided
    mutate?.();
    onClose();
  };

  return (
    <>
      {/* Trigger button */}
      <IconButton
        aria-label="Update Group"
        icon={<Edit size={16} />}
        colorScheme="blue"
        bg={buttonBgColor}
        color="white"
        size="sm"
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent onClick
          onOpen();
        }}
        _hover={{ bg: buttonHoverBgColor }}
      />

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={modalBgColor} color={textColor}>
          <ModalHeader>Update Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="center" width="100%">
              <Input
                placeholder="Enter new group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                width="100%"
                bg={inputBgColor}
              />
              <Textarea
                placeholder="Enter new group description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                width="100%"
                bg={inputBgColor}
              />
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Button
                aria-label='add profile picture'
                bgColor="blue.500"
                color="white"
                onClick={handleAddImage}
                variant="ghost"
                _hover={{ bg: "blue.600" }}
              >
                Update Group Profile Picture
              </Button>

              {/* Display selected image filename */}
              {image && (
                <HStack 
                  mt={2} 
                  p={2} 
                  bg={fileDisplayBgColor} 
                  borderRadius="md" 
                  width="auto"
                  alignSelf="center"
                  maxW="80%"
                >
                  <Text fontSize="sm">{image.name}</Text>
                  <IconButton
                    aria-label="Remove image"
                    icon={<Trash2 size={16} />}
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={handleRemoveImage}
                  />
                </HStack>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
              Update
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupModal;
