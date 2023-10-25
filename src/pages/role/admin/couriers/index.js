import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../firebase-config";
import { getSession } from "next-auth/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import {
  AiTwotoneEdit,
  AiFillDelete,
  AiFillEye,
  AiFillCheckCircle,
} from "react-icons/ai";
import {
  TableContainer,
  Table,
  Box,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Stack,
  Button,
  Heading,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  useDisclosure,
  useToast,
  Badge,
  Text,
  Divider,
  Avatar,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/admin" },
  { name: "Vendors", icon: FiTrendingUp, link: "/role/admin/vendors" },
  { name: "Couriers", icon: FiCompass, link: "/role/admin/couriers" },
];

const Couriers = ({ courierDocs, userSession }) => {
  const toast = useToast();

  const [couriers, setCouriers] = useState(courierDocs);
  const [selectedId, setSelectedId] = useState("");
  const [selectedItem, setSelectedItem] = useState([]);
  const [processLoading, setProcessLoading] = useState(false);

  const {
    isOpen: itemIsOpen,
    onOpen: itemOnOpen,
    onClose: itemOnClose,
  } = useDisclosure();
  const cancelRef = useRef();

  const openModal = (courier) => {
    setSelectedItem(courier);
    itemOnOpen();
  };

  const processVendor = async (courier, method) => {
    setProcessLoading(true);
    setSelectedId(courier.id);
    const indexOfObjectToUpdate = couriers.findIndex(
      (obj) => obj.id === courier.id
    );
    let status = method == "accept" ? "approved" : "blocked";
    const processResponse = await firestore
      .collection("users")
      .doc(courier.id)
      .update({ status: status });
    courier.status = status;
    setProcessLoading(false);
    courier[indexOfObjectToUpdate] = courier;
  };

  return (
    <>
      <AdminLayout
        metaTitle={"Vendor - Couriers"}
        pageName={"IT Kim - Admin"}
        user={userSession}
        LinkItems={LinkItems}
      >
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>List of Couriers</Heading>
        </HStack>

        <TableContainer
          background={"white"}
          p={{ base: 2, md: 5 }}
          borderRadius={6}
        >
          {couriers.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {couriers.map((courier) => (
                  <Tr>
                    <Td>
                      <HStack>
                        <Avatar boxSize={"32px"} src={courier.picture} />
                        <Text>{courier.name}</Text>
                      </HStack>
                    </Td>
                    <Td>{courier.email}</Td>
                    <Td textTransform={"uppercase"}>
                      <Badge>{courier.status}</Badge>
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={2}>
                        <Button
                          size={"sm"}
                          colorScheme="orange"
                          variant={"outline"}
                          leftIcon={<AiFillEye />}
                          onClick={() => openModal(courier)}
                        >
                          View Details
                        </Button>
                        {courier.status != "approved" && (
                          <>
                            <Button
                              leftIcon={<AiFillCheckCircle />}
                              colorScheme="blue"
                              variant="outline"
                              isLoading={
                                processLoading && selectedId == courier.id
                              }
                              disabled={
                                processLoading && selectedId != courier.id
                              }
                              size={"sm"}
                              onClick={() => processVendor(courier, "accept")}
                            >
                              Approve
                            </Button>
                          </>
                        )}
                        {courier.status != "blocked" && (
                          <Button
                            leftIcon={<AiFillDelete />}
                            colorScheme="red"
                            size={"sm"}
                            variant="outline"
                            onClick={() => processVendor(courier, "decline")}
                            isLoading={
                              processLoading && selectedId == courier.id
                            }
                            disabled={
                              processLoading && selectedId != courier.id
                            }
                          >
                            Block
                          </Button>
                        )}
                      </Stack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Box
              minH={"200px"}
              display={"grid"}
              placeItems={"center"}
              textAlign={"center"}
            >
              <Heading>No couriers yet</Heading>
            </Box>
          )}
        </TableContainer>
      </AdminLayout>

      <Modal isOpen={itemIsOpen} onClose={itemOnClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Courier Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack textAlign={"center"}>
              <Avatar
                src={selectedItem.storeLogo}
                boxSize={"100px"}
                border={"1px"}
              />
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Courier Name:</Text>{" "}
                {selectedItem.storeName}
              </Text>
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Courier Address:</Text>{" "}
                {selectedItem.addresses &&
                  `${selectedItem.addresses[0].address.no} ${selectedItem.addresses[0].address.street} ${selectedItem.addresses[0].address.barangay} ${selectedItem.addresses[0].address.city}`}
              </Text>
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Contact Number:</Text>{" "}
                {selectedItem.addresses &&
                  selectedItem.addresses[0].contactNumber}{" "}
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Couriers;

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
  userSession.user.status = userDoc.status ? userDoc.status : "";

  const courierResponse = await firestore
    .collection("users")
    .where("role", "==", "courier")
    .get();

  let courierDocs = !courierResponse.empty
    ? courierResponse.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;

        return returnDoc;
      })
    : [];

  return {
    props: { courierDocs, userSession },
  };
}
