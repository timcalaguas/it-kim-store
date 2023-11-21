import { useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { firestore } from "../../firebase-config";
import axios from "axios";

const AddressModal = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [type, setType] = useState("add");
  const [loading, setLoading] = useState(false);
  const [addressIndex, setAddressIndex] = useState(0);
  const [validPhone, setValidPhone] = useState(true);

  const [newAddress, setNewAddress] = useState({
    no: "",
    street: "",
    barangay: "Agapito del Rosario",
    city: "Angeles City",
    contact: "",
  });

  function isValidPHPhoneNumber(phoneNumber) {
    var phoneRegex = /^9\d{9}$/;

    if (phoneRegex.test(phoneNumber)) {
      setValidPhone(true);
      setNewAddress({ ...newAddress, contact: phoneNumber });
    } else {
      setNewAddress({ ...newAddress, contact: phoneNumber });
      setValidPhone(false);
    }

    console.log(validPhone);
  }

  const addAddress = async (user) => {
    try {
      setLoading(true);
      const userGet = await firestore.collection("users").doc(user.docId).get();

      if (
        newAddress.no == "" ||
        newAddress.contact == "" ||
        newAddress.street == "" || !validPhone
      ) {
        setLoading(false);
        const title = !validPhone ? "Invalid Phone number" : "Incomplete details.";
        const message = !validPhone ? "Please enter a valid number" : "Please complete the form before submitting.";
        
        toast({
          title: title,
          description: message,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
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
          const docRef = firestore.collection("users").doc(user.docId);

          const response = await docRef.update({
            addresses: updatedAddresses,
          });

          user.addresses = updatedAddresses;

          const updateSession = await axios.post("/api/auth", {
            user: user,
            role: user.role,
          });

          if (updateSession.status == 200) {
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
              barangay: "Agapito del Rosario",
              city: "Angeles City",
              contact: "",
            });
            onClose();
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const editAddress = async (user) => {
    try {
      setLoading(true);
      if (
        newAddress.no == "" ||
        newAddress.contact == "" ||
        newAddress.street == "" || !validPhone
      ) {
        setLoading(false);
        const title = !validPhone ? "Invalid Phone number" : "Incomplete details.";
        const message = !validPhone ? "Please enter a valid number" : "Please complete the form before submitting.";
        
        toast({
          title: title,
          description: message,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
        const nAddress = {
          address: {
            no: newAddress.no,
            street: newAddress.street,
            barangay: newAddress.barangay,
            city: newAddress.city,
          },
          contactNumber: newAddress.contact,
        };

        const currentAddresses = user.addresses;
        currentAddresses[addressIndex] = nAddress;
        const updatedAddresses = currentAddresses;
        const docRef = firestore.collection("users").doc(user.docId);

        const response = await docRef.update({
          addresses: updatedAddresses,
        });

        user.addresses = updatedAddresses;

        const updateSession = await axios.post("/api/auth", {
          user: user,
          role: user.role,
        });

        if (updateSession.status == 200) {
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
            barangay: "Agapito del Rosario",
            city: "Angeles City",
            contact: "",
          });
          onClose();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAddress = async (user) => {
    try {
      setLoading(true);

      const currentAddresses = user.addresses;
      currentAddresses.splice(addressIndex, 1);
      const updatedAddresses = currentAddresses;
      const docRef = firestore.collection("users").doc(user.docId);

      const response = await docRef.update({
        addresses: updatedAddresses,
      });

      user.addresses = updatedAddresses;

      const updateSession = await axios.post("/api/auth", {
        user: user,
        role: user.role,
      });

      if (updateSession.status == 200) {
        // Success
        toast({
          title: "Address deleted.",
          description: "We've deleted your new address for you.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);

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
    setAddressIndex,
    deleteAddress,
    newAddress,
    loading,
    type,
    isValidPHPhoneNumber,
    validPhone,
  };
};

export default AddressModal;
