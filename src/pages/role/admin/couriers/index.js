import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../firebase-config";
import { getSession } from "next-auth/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import {
  AiFillShop,
  AiFillDelete,
  AiFillEye,
  AiFillCheckCircle,
} from "react-icons/ai";
import { MdDeliveryDining, MdPerson } from "react-icons/md";
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import getUsers from "@/hooks/getUsers";
import { withSessionSsr } from "@/lib/withSession";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/admin" },
  { name: "Vendors", icon: AiFillShop, link: "/role/admin/vendors" },
  { name: "Couriers", icon: MdDeliveryDining, link: "/role/admin/couriers" },
  { name: "Customers", icon: MdPerson, link: "/role/admin/customers" },
];

const Couriers = ({ courierDocs, user }) => {
  const toast = useToast();

  const [couriers, setCouriers] = useState(courierDocs);
  const [selectedId, setSelectedId] = useState("");
  const [process, setProcess] = useState("accept");
  const [selectedItem, setSelectedItem] = useState([]);
  const [processLoading, setProcessLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: itemIsOpen,
    onOpen: itemOnOpen,
    onClose: itemOnClose,
  } = useDisclosure();
  const cancelRef = useRef();

  const openProcessDialog = (vendor, process) => {
    setSelectedItem(vendor);

    setProcess(process);
    onOpen();
  };

  const openModal = (courier) => {
    setSelectedItem(courier);
    itemOnOpen();
  };

  const processCourier = async () => {
    setProcessLoading(true);
    const indexOfObjectToUpdate = couriers.findIndex(
      (obj) => obj.id === selectedItem.id
    );
    let status = process == "accept" ? "approved" : "blocked";
    const processResponse = await firestore
      .collection("users")
      .doc(selectedItem.id)
      .update({ status: status });
    selectedItem.status = status;
    setProcessLoading(false);
    couriers[indexOfObjectToUpdate] = selectedItem;

    toast({
      title: process == "accept" ? "Approved" : "Blocked",
      description:
        process == "accept"
          ? "The courier is now approved."
          : "The courier is now blocked.",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
    onClose();
  };

  return (
    <>
      <AdminLayout
        metaTitle={"Admin - Couriers"}
        pageName={"IT Kim - Admin"}
        user={user}
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
                              size={"sm"}
                              onClick={() =>
                                openProcessDialog(courier, "accept")
                              }
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
                            onClick={() =>
                              openProcessDialog(courier, "decline")
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
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {process == "accept" ? "Approve Courier" : "Block Courier"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {process == "accept"
                ? "Are you sure you want to approve this courier? This will allow the courier to accept and deliver orders."
                : "Are you sure you want to block this courier? They will no longer be allowed to use website to accept orders."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={process == "accept" ? "blue" : "red"}
                onClick={() => processCourier()}
                ml={3}
                isLoading={processLoading}
              >
                {process == "accept" ? "Approve" : "Block"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
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

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const user = req.session.user;

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/role/admin/auth/login",
      },
    };
  }

  if (user.role != "admin") {
    return {
      notFound: true,
    };
  }

  const courierDocs = await getUsers("courier");

  return {
    props: { courierDocs, user },
  };
});
