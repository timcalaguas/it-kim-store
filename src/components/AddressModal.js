import { useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { firestore } from "../../firebase-config";

const AddressModal = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [type, setType] = useState("add");
  const [loading, setLoading] = useState(false);
  const [addressIndex, setAddressIndex] = useState(0);

  const [newAddress, setNewAddress] = useState({
    no: "",
    street: "",
    barangay: "",
    city: "",
    contact: "",
  });

  const addAddress = async (userSession) => {
    try {
      setLoading(true);
      const userGet = await firestore
        .collection("users")
        .doc(userSession.user.docId)
        .get();

      if (userGet.exists) {
        const nAddress = {
          address: {
            no: newAddress.no,
            street: newAddress.street,
            barangay: newAddress.barangay,
            city: newAddress.city,
          },
          contactNumber: newAddress.contact,
        };

        const currentAddresses = userGet.data().addresses;
        const updatedAddresses = [...currentAddresses, nAddress];
        const docRef = firestore
          .collection("users")
          .doc(userSession.user.docId);

        const response = await docRef.update({
          addresses: updatedAddresses,
        });

        // Success
        toast({
          title: "Address added.",
          description: "We've added your new address for you.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        setNewAddress({
          no: "",
          street: "",
          barangay: "",
          city: "",
          contact: "",
        });
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const editAddress = async (userSession, index) => {
    try {
      setLoading(true);
      const userGet = await firestore
        .collection("users")
        .doc(userSession.user.docId)
        .get();

      if (userGet.exists) {
        const nAddress = {
          address: {
            no: newAddress.no,
            street: newAddress.street,
            barangay: newAddress.barangay,
            city: newAddress.city,
          },
          contactNumber: newAddress.contact,
        };

        const currentAddresses = userGet.data().addresses;
        currentAddresses[index] = nAddress;
        const updatedAddresses = currentAddresses;
        const docRef = firestore
          .collection("users")
          .doc(userSession.user.docId);

        const response = await docRef.update({
          addresses: updatedAddresses,
        });

        // Success
        toast({
          title: "Address edited.",
          description: "We've edited your new address for you.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        setNewAddress({
          no: "",
          street: "",
          barangay: "",
          city: "",
          contact: "",
        });
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    isOpen,
    onOpen,
    onClose,
    setType,
    setNewAddress,
    addAddress,
    editAddress,
    newAddress,
    loading,
    type,
  };
};

export default AddressModal;
