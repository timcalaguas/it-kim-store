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

import { BiSolidShoppingBag } from "react-icons/bi";
import { FaPesoSign } from "react-icons/fa6";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/admin" },
  { name: "Vendors", icon: AiFillShop, link: "/role/admin/vendors" },
  { name: "Couriers", icon: MdDeliveryDining, link: "/role/admin/couriers" },
  { name: "Customers", icon: MdPerson, link: "/role/admin/customers" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/admin/sales-report" },
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

    let status =
      process == "accept"
        ? "approved"
        : process == "decline"
        ? "declined"
        : "blocked";

    const processResponse = await firestore
      .collection("users")
      .doc(selectedItem.id)
      .update({ status: status, adminBy: user.name });
    selectedItem.status = status;
    setProcessLoading(false);
    vendors[indexOfObjectToUpdate] = selectedItem;

    toast({
      title:
        process == "accept"
          ? "Approved"
          : process == "decline"
          ? "Declined"
          : "Blocked",
      description:
        process == "accept"
          ? "The vendor is now approved."
          : process == "decline"
          ? "The vendor is now declined."
          : "The vendor is now blocked.",
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
                  <Th>Rating</Th>
                  <Th>Status</Th>
                  <Th>Moderated by</Th>
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
                    <Td>
                      {courier.rating ? (
                        <HStack>
                          <Text>{courier.rating.toFixed(2)}</Text>{" "}
                          <FaStar color="gold" />
                        </HStack>
                      ) : (
                        "N/A"
                      )}
                    </Td>
                    <Td textTransform={"uppercase"}>
                      <Badge>{courier.status}</Badge>
                    </Td>
                    <Td>
                      {courier.adminBy ? <Text>{courier.adminBy}</Text> : "N/A"}
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={2}>
                        <Button
                          size={"sm"}
                          colorScheme="orange"
                          variant={"outline"}
                          leftIcon={<AiFillEye />}
                          as={Link}
                          href={`/role/admin/couriers/${courier.id}`}
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
                        {courier.status == "pending" && (
                          <Button
                            leftIcon={<AiFillDelete />}
                            colorScheme="red"
                            size={"sm"}
                            variant="outline"
                            onClick={() =>
                              openProcessDialog(courier, "decline")
                            }
                          >
                            Decline
                          </Button>
                        )}
                        {courier.status != "pending" &&
                          courier.status != "blocked" && (
                            <Button
                              leftIcon={<AiFillDelete />}
                              colorScheme="red"
                              size={"sm"}
                              variant="outline"
                              onClick={() =>
                                openProcessDialog(courier, "block")
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
              {process == "accept"
                ? "Approve Courier"
                : process == "decline"
                ? "Decline Courier"
                : "Block Courier"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {process == "accept"
                ? "Are you sure you want to approve this courier? This will allow the courier to accept and deliver orders."
                : process == "accept"
                ? "Are you sure you want to decline this courier? They will have to update their info in order to verify again."
                : "Are you sure you want to block this courier? They will block the courier to use the system."}
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
                {process == "accept"
                  ? "Approve"
                  : process == "decline"
                  ? "Decline"
                  : "Block"}
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
                src={selectedItem?.storeLogo}
                boxSize={"100px"}
                border={"1px"}
              />
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Courier Name:</Text>{" "}
                {selectedItem?.name}
              </Text>
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Courier Address:</Text>{" "}
                {selectedItem?.addresses &&
                  `${selectedItem?.addresses[0]?.address.no} ${selectedItem.addresses[0]?.address.street} ${selectedItem.addresses[0]?.address.barangay} ${selectedItem.addresses[0]?.address.city}`}
              </Text>
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Contact Number:</Text>{" "}
                {selectedItem?.addresses &&
                  selectedItem?.addresses[0]?.contactNumber}{" "}
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
