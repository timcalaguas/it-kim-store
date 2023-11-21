import {
  Box,
  HStack,
  Image,
  Heading,
  Text,
  Divider,
  VStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Input,
  FormLabel,
  Select,
  Avatar,
  FormErrorMessage,
  InputLeftAddon,
  InputGroup,
} from "@chakra-ui/react";
import { IoLocationSharp } from "react-icons/io5";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import Layout from "@/components/Layout";
import AddressModal from "@/components/AddressModal";
import { withSessionSsr } from "@/lib/withSession";

const barangays = [
  "Agapito del Rosario",
  "Amsic",
  "Anunas",
  "Balibago",
  "Capaya",
  "Claro M. Recto",
  "Cuayan",
  "Cutcut",
  "Cutud",
  "Lourdes North West",
  "Lourdes Sur (Talimundoc)",
  "Lourdes Sur East",
  "Malabañas",
  "Margot",
  "Marisol (Ninoy Aquino)",
  "Mining",
  "Pampang (Santo Niño)",
  "Pandan",
  "Pulung Bulu",
  "Pulung Cacutud",
  "Pulung Maragul",
  "Salapungan",
  "San José",
  "San Nicolas",
  "Santa Teresita",
  "Santa Trinidad",
  "Santo Cristo",
  "Santo Domingo",
  "Santo Rosario (Población)",
  "Sapalibutad",
  "Sapangbato",
  "Tabun",
  "Virgen Delos Remedios",
];

const Profile = ({ user }) => {
  const {
    isOpen,
    onOpen,
    onClose,
    setType,
    addAddress,
    editAddress,
    setAddressIndex,
    newAddress,
    setNewAddress,
    deleteAddress,
    loading,
    type,
    isValidPHPhoneNumber,
    validPhone,
  } = AddressModal();

  const setAddress = (address) => {
    setNewAddress({
      no: address.address.no,
      street: address.address.street,
      barangay: address.address.barangay,
      city: address.address.city,
      contact: address.contactNumber,
    });
  };

  console.log(newAddress);

  return (
    <Layout metaTitle={"IT Kim - Profile"} user={user}>
      <Box
        maxW={"1440px"}
        marginInline={"auto"}
        minH={"100vh"}
        paddingTop={"120px"}
        display={"grid"}
        placeItems={"center"}
        paddingInline={"32px"}
      >
        <VStack
          w={"100%"}
          maxW={"720px"}
          border={"1px"}
          borderRadius={"md"}
          padding={"32px"}
          borderColor={"gray.100"}
          minH={"500px"}
          gap={"24px"}
          alignItems={"start"}
        >
          <Heading>Profile</Heading>
          <HStack gap={"24px"} flexWrap={"wrap"}>
            <Avatar
              src={user?.picture}
              name={user?.name}
              borderRadius={"full"}
              boxSize={"120px"}
            />
            <Box flexWrap={"wrap"}>
              <Heading fontSize={"2xl"} textTransform={"uppercase"}>
                {user?.name}
              </Heading>
              <Text>{user.email}</Text>
              <Text>{user.contactNumber}</Text>
            </Box>
          </HStack>
          <Divider />
          <VStack w={"100%"} gap={"12px"}>
            <HStack justify={"space-between"} w={"100%"} mb={"24px"}>
              <Heading fontSize={"2xl"}>Address</Heading>
              <Button
                size={"sm"}
                variant={"primary"}
                onClick={() => {
                  onOpen();
                  setType("add");
                }}
              >
                Add new
              </Button>
            </HStack>
            <VStack w={"100%"}>
              {user.addresses.length > 0 ? (
                user.addresses.map((address, index) => (
                  <HStack
                    width={"100%"}
                    border={"1px"}
                    borderColor={"gray.100"}
                    padding={"10px"}
                  >
                    <IoLocationSharp fontSize={"32px"} />
                    <HStack justifyContent={"space-between"} w={"100%"}>
                      <Box>
                        <Text fontWeight={"semibold"}>
                          {address.address.no} {address.address.street},{" "}
                          {address.address.barangay}, {address.address.city}
                        </Text>
                        <Text>{address.contactNumber}</Text>
                      </Box>
                      <HStack>
                        <Button
                          colorScheme="blue"
                          onClick={() => {
                            onOpen();
                            setType("edit");
                            setAddress(address);
                            setAddressIndex(index);
                          }}
                        >
                          <AiFillEdit />
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={() => {
                            onOpen();
                            setType("delete");
                            setAddress(address);
                            setAddressIndex(index);
                          }}
                        >
                          <AiFillDelete />
                        </Button>
                      </HStack>
                    </HStack>
                  </HStack>
                ))
              ) : (
                <Text>No Address yet</Text>
              )}
            </VStack>
          </VStack>
        </VStack>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {type == "add"
              ? `Add new `
              : type == "edit"
              ? "Update "
              : "Delete "}
            Address
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {type != "delete" ? (
              <VStack>
                <FormControl isInvalid={!validPhone}>
                  <FormLabel>Contact Number</FormLabel>
                  <InputGroup>
                    <InputLeftAddon children="+63" />
                    <Input
                      type="tel"
                      placeholder="9123456789"
                      value={newAddress.contact}
                      onChange={(e) => isValidPHPhoneNumber(e.target.value)}
                      required
                    />
                  </InputGroup>
                  {!validPhone && (
                    <FormErrorMessage>Invalid Phone Number</FormErrorMessage>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>House No. / Blk No. / Lot No.</FormLabel>
                  <Input
                    required
                    type="text"
                    value={newAddress.no}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, no: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Street</FormLabel>
                  <Input
                    required
                    type="text"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Barangay</FormLabel>

                  <Select
                    value={newAddress.barangay}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, barangay: e.target.value })
                    }
                  >
                    {barangays.map((barangay) => (
                      <option value={barangay}>{barangay}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>City</FormLabel>

                  <Select
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                  >
                    <option value={"Angeles City"}>Angeles City</option>
                  </Select>
                </FormControl>
              </VStack>
            ) : (
              <Text>Are you sure you want to delete this address?</Text>
            )}
          </ModalBody>

          <ModalFooter>
            {type == "add" && (
              <Button
                variant="primary"
                onClick={() => addAddress(user)}
                isLoading={loading}
              >
                Add
              </Button>
            )}
            {type == "edit" && (
              <Button
                variant="primary"
                onClick={() => editAddress(user)}
                isLoading={loading}
              >
                Update
              </Button>
            )}
            {type == "delete" && (
              <Button
                colorScheme="red"
                onClick={() => deleteAddress(user)}
                isLoading={loading}
              >
                Delete
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default Profile;

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const user = req.session.user ? req.session.user : null;

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: { providers: [] },
    };
  }

  if (user.role != "customer") {
    return {
      notFound: true,
    };
  }

  return {
    props: { user },
  };
});
