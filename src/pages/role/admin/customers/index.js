import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../firebase-config";
import { getSession } from "next-auth/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import {
  AiFillDelete,
  AiFillShop,
  AiFillEye,
  AiFillCheckCircle,
} from "react-icons/ai";
import { MdPerson, MdDeliveryDining } from "react-icons/md";
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

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/admin" },
  { name: "Vendors", icon: AiFillShop, link: "/role/admin/vendors" },
  { name: "Couriers", icon: MdDeliveryDining, link: "/role/admin/couriers" },
  { name: "Customers", icon: MdPerson, link: "/role/admin/customers" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/admin/sales-report" },
];

const Couriers = ({ customerDocs, user }) => {
  const toast = useToast();

  const [customers, setCustomers] = useState(customerDocs);
  const [selectedId, setSelectedId] = useState("");
  const [process, setProcess] = useState("accept");
  const [selectedItem, setSelectedItem] = useState({});
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

  const openModal = (customer) => {
    setSelectedItem(customer);
    itemOnOpen();
  };

  const processCustomer = async () => {
    setProcessLoading(true);
    const indexOfObjectToUpdate = customers.findIndex(
      (obj) => obj.id === selectedItem.id
    );
    let status = process == "accept" ? "approved" : "blocked";
    const processResponse = await firestore
      .collection("users")
      .doc(selectedItem.id)
      .update({ status: status });
    selectedItem.status = status;
    setProcessLoading(false);
    customers[indexOfObjectToUpdate] = selectedItem;

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
        metaTitle={"Admin - Customers"}
        pageName={"IT Kim - Admin"}
        user={user}
        LinkItems={LinkItems}
      >
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>List of Customers</Heading>
        </HStack>

        <TableContainer
          background={"white"}
          p={{ base: 2, md: 5 }}
          borderRadius={6}
        >
          {customers.length > 0 ? (
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
                {customers.map((customer) => (
                  <Tr>
                    <Td>
                      <HStack>
                        <Avatar boxSize={"32px"} src={customer.picture} />
                        <Text>{customer.name}</Text>
                      </HStack>
                    </Td>
                    <Td>{customer.email}</Td>
                    <Td textTransform={"uppercase"}>
                      <Badge>{customer.status}</Badge>
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={2}>
                        <Button
                          size={"sm"}
                          colorScheme="orange"
                          variant={"outline"}
                          leftIcon={<AiFillEye />}
                          onClick={() => openModal(customer)}
                        >
                          View Details
                        </Button>
                        {customer.status != "approved" && (
                          <>
                            <Button
                              leftIcon={<AiFillCheckCircle />}
                              colorScheme="blue"
                              variant="outline"
                              size={"sm"}
                              onClick={() =>
                                openProcessDialog(customer, "accept")
                              }
                            >
                              Approve
                            </Button>
                          </>
                        )}
                        {customer.status != "blocked" && (
                          <Button
                            leftIcon={<AiFillDelete />}
                            colorScheme="red"
                            size={"sm"}
                            variant="outline"
                            onClick={() =>
                              openProcessDialog(customer, "decline")
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
              <Heading>No customers yet</Heading>
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
              {process == "accept" ? "Approve Customer" : "Block Customer"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {process == "accept"
                ? "Are you sure you want to approve this customer? This will allow the customer to order products to all of the approved vendors."
                : "Are you sure you want to block this customer? They will no longer be allowed to use the store."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={process == "accept" ? "blue" : "red"}
                onClick={() => processCustomer()}
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
          <ModalHeader>Customer Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack textAlign={"center"}>
              <Avatar
                src={selectedItem.storeLogo}
                boxSize={"100px"}
                border={"1px"}
              />
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Name:</Text> {selectedItem.name}
              </Text>

              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Address:</Text>
                {selectedItem.addresses && selectedItem.addresses.length > 0 ? (
                  <Text>
                    {selectedItem.addresses[0].address.no}{" "}
                    {selectedItem.addresses[0].address.street}{" "}
                    {selectedItem.addresses[0].address.barangay}{" "}
                    {selectedItem.addresses[0].address.city}
                  </Text>
                ) : (
                  <Text>N/A</Text>
                )}
              </Text>
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Contact Number:</Text>
                {selectedItem.addresses && selectedItem.addresses.length > 0 ? (
                  <Text>selectedItem.addresses[0].contactNumber</Text>
                ) : (
                  <Text>N/A</Text>
                )}
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

  const customerDocs = await getUsers("customer");

  return {
    props: { customerDocs, user },
  };
});
