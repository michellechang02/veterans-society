import React from 'react';
import {
  Box,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorModeValue
} from '@chakra-ui/react';

interface ChatModalProps {
  modalTitle: string;
  placeholder?: string;
  buttonText: string;
  inputValue?: string;
  setInputValue?: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  isOpen: boolean;
  onClose: () => void;
  confirmationMessage?: string;
  isDanger?: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({
  modalTitle,
  placeholder,
  buttonText,
  inputValue,
  setInputValue,
  onSubmit,
  isOpen,
  onClose,
  confirmationMessage,
  isDanger = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('black', 'white');
  const inputBg = useColorModeValue('white', 'gray.700');

  return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={bgColor} color={textColor}>
          <ModalHeader>{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {confirmationMessage ? (
              <Box>{confirmationMessage}</Box>
            ) : (
              <Input
                value={inputValue}
                onChange={(e) => setInputValue && setInputValue(e.target.value)}
                placeholder={placeholder}
                bg={inputBg}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              bgColor={isDanger ? "red.500" : "gray.500"}
              color="white"
              onClick={() => {
                onSubmit();
                onClose();
              }}
            >
              {buttonText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default ChatModal;
