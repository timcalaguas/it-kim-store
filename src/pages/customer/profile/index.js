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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { IoLocationSharp } from "react-icons/io5";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import Layout from "@/components/Layout";
import { getSession } from "next-auth/react";
import { firestore } from "../../../../firebase-config";
import AddressModal from "@/components/AddressModal";

const Profile = ({ userSession }) => {
  const {
    isOpen,
    onOpen,
    onClose,
    setType,
    addAddress,
    editAddress,
    newAddress,
    setNewAddress,
    loading,
    type,
  } = AddressModal();

  return (
    <Layout metaTitle={"IT Kim - Profile"}>
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
            <Image
              src={userSession?.user?.picture}
              alt={userSession?.user?.name}
              borderRadius={"full"}
              boxSize={"120px"}
            />
            <Box flexWrap={"wrap"}>
              <Heading fontSize={"2xl"} textTransform={"uppercase"}>
                {userSession?.user?.name}
              </Heading>
              <Text>{userSession.user.email}</Text>
              <Text>{userSession.user.contactNumber}</Text>
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
              {userSession.user.addresses.length > 0 ? (
                userSession.user.addresses.map((address) => (
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
                          {address.address.no} {address.address.street},
                          {address.address.barangay}, {address.address.city}
                        </Text>
                        <Text>{address.contactNumber}</Text>
                      </Box>
                      <HStack>
                        <Button
                          onClick={() => {
                            onOpen();
                            setType("edit");
                          }}
                        >
                          <AiFillEdit />
                        </Button>
                        <Button>
                          <AiFillDelete
                            onClick={() => {
                              onOpen();
                              setType("delete");
                            }}
                          />
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
          <ModalHeader>Add new Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <FormControl>
                <FormLabel>Contact Number</FormLabel>
                <Input
                  type="number"
                  value={newAddress.contact}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, contact: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>House No. / Blk No. / Lot No.</FormLabel>
                <Input
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
                  type="text"
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, street: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Barangay</FormLabel>
                <Input
                  type="text"
                  value={newAddress.barangay}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, barangay: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            {type == "add" && (
              <Button
                variant="primary"
                onClick={() => addAddress(userSession)}
                _loading={loading}
              >
                Add
              </Button>
            )}
            {type == "edit" && (
              <Button
                variant="primary"
                onClick={editAddress}
                _loading={loading}
              >
                Update
              </Button>
            )}
            {type == "delete" && (
              <Button colorScheme="red" onClick={addAddress} _loading={loading}>
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

export async function getServerSideProps(context) {
  const userSession = await getSession(context);

  if (!userSession) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: { providers: [] },
    };
  }

  const response = await firestore
    .collection("users")
    .where("email", "==", userSession.user.email)
    .limit(1)
    .get();

  const userDoc = !response.empty ? response.docs[0].data() : {};
  userSession.user.addresses = userDoc.addresses ? userDoc.addresses : [];
  userSession.user.docId = response.docs[0].id;

  return {
    props: { userSession },
  };
}
