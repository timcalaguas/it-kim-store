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
  Link,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
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
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import moment from "moment/moment";
import getVendorOrders from "@/hooks/vendors/getVendorOrders";
import { withSessionSsr } from "@/lib/withSession";
import axios from "axios";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/vendor" },
  { name: "Products", icon: FiTrendingUp, link: "/role/vendor/products" },
  { name: "Orders", icon: FiCompass, link: "/role/vendor/orders" },
];

const Orders = ({ orderDocs, user }) => {
  const toast = useToast();

  const [orders, setOrders] = useState(orderDocs);
  const [process, setProcess] = useState("");
  const [selectedItem, setSelectedItem] = useState([]);
  const [processLoading, setProcessLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: itemIsOpen,
    onOpen: itemOnOpen,
    onClose: itemOnClose,
  } = useDisclosure();
  const cancelRef = useRef();

  const openDeleteDialog = (order, process) => {
    setSelectedItem(order);

    setProcess(process);
    onOpen();
  };

  const openModal = (order) => {
    setSelectedItem(order);
    itemOnOpen();
  };

  const processOrder = async () => {
    setProcessLoading(true);
    const indexOfObjectToUpdate = orders.findIndex(
      (obj) => obj.id === selectedItem.id
    );

    // const body = {
    //   to: "tmthy011@gmail.com",
    //   subject: "asdsada",
    //   body: "adadadas",
    // };

    // if (process == "decline") {
    //   const response = await axios.post("/api/send-mail", body);

    //   console.log(response);
    // }

    let status = process == "accept" ? "order-accepted" : "order-declined";
    const processResponse = await firestore
      .collection("orders")
      .doc(selectedItem.id)
      .update({ status: status });
    selectedItem.status = status;
    setProcessLoading(false);
    onClose();
    orders[indexOfObjectToUpdate] = selectedItem;
    toast({
      title: process == "accept" ? "Order Accepted" : "Order Declined",
      description:
        process == "accept"
          ? "The order is now accepted."
          : "The order is now declined.",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  };

  return (
    <>
      <AdminLayout
        metaTitle={"Vendor - Orders"}
        pageName={"IT Kim - Vendor"}
        user={user}
        LinkItems={LinkItems}
      >
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>List of Orders</Heading>
        </HStack>

        <TableContainer
          background={"white"}
          p={{ base: 2, md: 5 }}
          borderRadius={6}
        >
          {orders.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Order ID</Th>
                  <Th>Date</Th>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr>
                    <Td>{order.id}</Td>
                    <Td>{moment(new Date()).format("MM/DD/YYYY")}</Td>
                    <Td>{order.customerName}</Td>
                    <Td textTransform={"uppercase"}>
                      <Badge>{order.status}</Badge>
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={2}>
                        <Button
                          size={"sm"}
                          colorScheme="orange"
                          variant={"outline"}
                          leftIcon={<AiFillEye />}
                          onClick={() => openModal(order)}
                        >
                          View Details
                        </Button>
                        {order.status == "order-placed" && (
                          <>
                            <Button
                              leftIcon={<AiFillCheckCircle />}
                              colorScheme="blue"
                              variant="outline"
                              size={"sm"}
                              onClick={() => openDeleteDialog(order, "accept")}
                            >
                              Accept
                            </Button>
                            <Button
                              leftIcon={<AiFillDelete />}
                              colorScheme="red"
                              size={"sm"}
                              variant="outline"
                              onClick={() => openDeleteDialog(order, "decline")}
                            >
                              Decline
                            </Button>
                          </>
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
              <Heading>No orders yet</Heading>
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
              {process == "accept" ? "Accept Order" : "Decline Order"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {process == "accept"
                ? "Are you sure you want to accept this order? After accepting this order will be available to all couriers."
                : "Are you sure you want to decline this order? After declining the order will be cancelled and the customer will be notified."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={process == "accept" ? "blue" : "red"}
                onClick={() => processOrder()}
                ml={3}
                isLoading={processLoading}
              >
                {process == "accept" ? "Accept" : "Decline"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={itemIsOpen} onClose={itemOnClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={"12px"}>
              <Text fontWeight={"500"}>Address:</Text>{" "}
              {selectedItem.address &&
                `${selectedItem.address.address.no} ${selectedItem.address.address.street} ${selectedItem.address.address.barangay} ${selectedItem.address.address.city}`}
            </Text>
            <Text mb={"12px"}>
              <Text fontWeight={"500"}>Contact Number:</Text>{" "}
              {selectedItem.address && selectedItem.address.contactNumber}{" "}
            </Text>
            <Divider marginBlock={"6px"} />
            <Box>
              <Text fontWeight={"600"}>Items</Text>
              {selectedItem.items &&
                selectedItem.items.map((item) => (
                  <HStack
                    paddingBlock={4}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    w={"100%"}
                    flexWrap={"wrap"}
                    key={item.id}
                  >
                    <HStack gap={4} w={"50%"}>
                      <Image
                        src={item.image}
                        boxSize={"50px"}
                        borderRadius={"lg"}
                      />
                      <Box>
                        <Text fontSize={"md"} fontWeight={"medium"}>
                          {item.productName}
                        </Text>
                        <Text fontSize={"md"}>{item.discountedPrice}</Text>
                      </Box>
                    </HStack>
                    <HStack>
                      <Text fontSize={"md"}>x {item.quantity}</Text>
                    </HStack>
                  </HStack>
                ))}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Orders;

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const user = req.session.user ? req.session.user : null;

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/role/vendor/auth/login",
      },
    };
  }

  const orderDocs = await getVendorOrders(user.docId);

  return {
    props: { orderDocs, user },
  };
});
