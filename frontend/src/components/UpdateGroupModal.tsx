import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { Edit } from "react-feather";

type UpdateGroupModalProps = {
  group: {
    groupId: string;
    name: string;
    description: string;
  };
  onUpdateGroup: (updatedGroup: { groupId: string; name: string; description: string }) => void;
  mutate?: () => void;
};

const UpdateGroupModal: React.FC<UpdateGroupModalProps> = ({ group, onUpdateGroup, mutate }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupName, setGroupName] = useState<string>(group.name);
  const [groupDescription, setGroupDescription] = useState<string>(group.description);

  const handleUpdate = () => {
    onUpdateGroup({
      groupId: group.groupId,
      name: groupName,
      description: groupDescription,
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
        bg="gray.500"
        color="white"
        size="sm"
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent onClick
          onOpen();
        }}
        _hover={{ bg: "gray.600" }}
      />

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter new group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              mb={4}
            />
            <Textarea
              placeholder="Enter new group description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
            />
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
