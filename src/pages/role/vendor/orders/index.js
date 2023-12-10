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
  Avatar,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverBody,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import moment from "moment/moment";
import getVendorOrders from "@/hooks/vendors/getVendorOrders";
import { withSessionSsr } from "@/lib/withSession";
import axios from "axios";
import getBodyForEmail from "@/hooks/getBodyForEmail";
import { FaQuestionCircle } from "react-icons/fa";

import { FaPesoSign } from "react-icons/fa6";
import { AiFillShopping } from "react-icons/ai";
import { BsFillCartCheckFill } from "react-icons/bs";
const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/vendor" },
  { name: "Products", icon: AiFillShopping, link: "/role/vendor/products" },
  { name: "Orders", icon: BsFillCartCheckFill, link: "/role/vendor/orders" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/vendor/sales-report" },
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

    let status =
      process == "accept"
        ? "order-accepted"
        : process == "accept-gcash"
        ? "payment-needed"
        : "order-declined";

    const bodyForEmail = await getBodyForEmail(
      status,
      selectedItem.customer,
      user
    );

    const response = await axios.post("/api/send-mail", bodyForEmail);

    let message =
      process == "accept"
        ? "Your order is accepted by the vendor. Please wait till a courier accept your order."
        : process == "accept-gcash"
        ? "Your order is acknowledge by the vendor. Please pay the order's total via GCash QR."
        : "Your order has been declined by the vendor. This is because your order cannot be processed by the vendor.";

    const createNotif = await firestore
      .collection("notifications")
      .doc()
      .set({
        id: selectedItem.customer.id,
        courierId: selectedItem.id,
        orderId: selectedItem.id,
        status: status,
        message: message,
        date: moment(new Date()).format("MM-DD-YYYY HH:mm"),
      });

    const processResponse = await firestore
      .collection("orders")
      .doc(selectedItem.id)
      .update({ status: status });
    selectedItem.status = status;
    setProcessLoading(false);
    onClose();
    orders[indexOfObjectToUpdate] = selectedItem;
    toast({
      title:
        process == "accept"
          ? "Order Accepted"
          : process == "accept-gcash"
          ? "Order Acknowledge"
          : "Order Declined",
      description:
        process == "accept"
          ? "The order is now accepted."
          : process == "accept-gcash"
          ? "The order is now acknowldge."
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
                  <Th>Payment Method</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr>
                    <Td>{order.id}</Td>
                    <Td>{moment(new Date()).format("MM/DD/YYYY")}</Td>
                    <Td>{order.customer.name}</Td>
                    <Td>{order.paymentMethod}</Td>
                    <Td textTransform={"uppercase"}>
                      {order.status == "cancelled" ? (
                        <Popover>
                          <PopoverTrigger>
                            <Badge
                              display={"flex"}
                              w={"fit-content"}
                              alignItems={"center"}
                              gap={"6px"}
                              cursor={"pointer"}
                              colorScheme={
                                order.status == "received" ||
                                order.status == "delivered"
                                  ? "green"
                                  : order.status == "order-placed" ||
                                    order.status == "order-accepted" ||
                                    order.status == "in-transit"
                                  ? "blue"
                                  : "red"
                              }
                            >
                              {order.status}{" "}
                              <FaQuestionCircle fontSize={"10px"} />
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader>Cancel Reason</PopoverHeader>
                            <PopoverBody>{order.cancelReason}</PopoverBody>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Badge
                          colorScheme={
                            order.status == "received" ||
                            order.status == "delivered"
                              ? "green"
                              : order.status == "order-placed" ||
                                order.status == "order-accepted" ||
                                order.status == "in-transit"
                              ? "blue"
                              : "red"
                          }
                        >
                          {order.status}
                        </Badge>
                      )}
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
                        {order.status == "order-placed" &&
                          order.status != "cancelled" &&
                          order.paymentMethod == "Cash on Delivery" && (
                            <>
                              <Button
                                leftIcon={<AiFillCheckCircle />}
                                colorScheme="blue"
                                variant="outline"
                                size={"sm"}
                                onClick={() =>
                                  openDeleteDialog(order, "accept")
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                leftIcon={<AiFillDelete />}
                                colorScheme="red"
                                size={"sm"}
                                variant="outline"
                                onClick={() =>
                                  openDeleteDialog(order, "decline")
                                }
                              >
                                Decline
                              </Button>
                            </>
                          )}
                        {order.status == "order-placed" &&
                        order.status != "cancelled" &&
                        order.paymentMethod == "GCash" ? (
                          <>
                            <Button
                              leftIcon={<AiFillCheckCircle />}
                              colorScheme="blue"
                              variant="outline"
                              size={"sm"}
                              onClick={() =>
                                openDeleteDialog(order, "accept-gcash")
                              }
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
                        ) : (
                          order.paymentMethod == "GCash" && (
                            <>
                              <Button
                                leftIcon={<AiFillCheckCircle />}
                                colorScheme="blue"
                                variant="outline"
                                size={"sm"}
                                onClick={() =>
                                  openDeleteDialog(order, "accept")
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                leftIcon={<AiFillDelete />}
                                colorScheme="red"
                                size={"sm"}
                                variant="outline"
                                onClick={() =>
                                  openDeleteDialog(order, "decline")
                                }
                              >
                                Decline
                              </Button>
                            </>
                          )
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
              {process == "accept"
                ? "Accept Order"
                : process == "accept-gcash"
                ? "Acknowledge Order"
                : "Decline Order"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {selectedItem.status == "paid" && (
                <>
                  <Text fontWeight={"600"} mb="12px">
                    Receipt:
                  </Text>
                  <Image src={selectedItem.receipt} mb={"24px"} />
                </>
              )}
              {process == "accept"
                ? "Are you sure you want to accept this order? After accepting this order will be available to all couriers."
                : process == "accept-gcash"
                ? "Are you sure you want to acknowldge this order? The QR Code of your GCash will be shown to the customer."
                : "Are you sure you want to decline this order? After declining the order will be cancelled and the customer will be notified."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={
                  process == "accept" || process == "accept-gcash"
                    ? "blue"
                    : "red"
                }
                onClick={() => processOrder()}
                ml={3}
                isLoading={processLoading}
              >
                {process == "accept" || process == "accept-gcash"
                  ? "Accept"
                  : "Decline"}
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
            <HStack mb={"12px"}>
              <Avatar src={selectedItem.customer?.picture} />
              <Box>
                <Text>{selectedItem.customer?.name}</Text>
                <Text>{selectedItem.customer?.email}</Text>
              </Box>
            </HStack>
            <Text mb={"12px"}>
              <Text fontWeight={"500"}>Address:</Text>{" "}
              {selectedItem.customer?.address &&
                `${selectedItem.customer.address.address.no} ${selectedItem.customer.address.address.street} ${selectedItem.customer.address.address.barangay} ${selectedItem.customer.address.address.city}`}
            </Text>
            <Text mb={"12px"}>
              <Text fontWeight={"500"}>Contact Number:</Text>{" "}
              {selectedItem.customer?.address &&
                selectedItem.customer.address.contactNumber}{" "}
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
            <VStack alignItems={"end"}>
              <Text>
                <b>Subtotal:</b> {selectedItem.subtotal}
              </Text>
              <Text>
                <b>Shipping Fee:</b>{" "}
                {selectedItem.total - selectedItem.subtotal}
              </Text>
              <Text>
                <b>Total:</b> {selectedItem.total}
              </Text>
            </VStack>
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

  if (user.role != "vendor") {
    return {
      notFound: true,
    };
  }

  const orderDocs = await getVendorOrders(user.docId);

  return {
    props: { orderDocs, user },
  };
});
