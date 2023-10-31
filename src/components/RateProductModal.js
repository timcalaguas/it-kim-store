import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  Input,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import { useState } from "react";
import StarRatingInput from "./StarRatingInput";

const RateProductModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedProduct, setSelectedProduct] = useState();

  const [rating, setRating] = useState(0);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const openRatingModal = (item) => {
    onOpen();
    setRating(0);
    setSelectedProduct(item);
  };

  const RateModal = () => {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Rate {isOpen ? selectedProduct.productName : ""}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            flexDirection={"column"}
            alignItems={"start"}
            gap={"24px"}
          >
            <FormControl>
              <FormLabel>Rating</FormLabel>
              <StarRatingInput
                rating={rating}
                onRatingChange={handleRatingChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Comment</FormLabel>
              <Textarea />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="primary">Rate</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return { RateModal, openRatingModal, setSelectedProduct };
};

export default RateProductModal;
