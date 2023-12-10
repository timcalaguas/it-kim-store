import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../../firebase-config";
import { FiHome, FiCompass, FiStar } from "react-icons/fi";
import { AiFillEye, AiFillCheckCircle } from "react-icons/ai";
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
  Avatar,
  VStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  useToast,
  Badge,
  Text,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import moment from "moment/moment";
import { withSessionSsr } from "@/lib/withSession";
import getAvailableOrders from "@/hooks/courier/getAvailableOrders";
import axios from "axios";
import getBodyForEmail from "@/hooks/getBodyForEmail";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/courier" },
  {
    name: "Available Orders",
    icon: FiCompass,
    link: "/role/courier/orders/available",
  },
  { name: "Finished Orders", icon: FiStar, link: "/role/courier/orders/done" },
];

const Orders = ({ orderDocs, userSession }) => {
  const toast = useToast();

  const [user, setUser] = useState(userSession);
  const [orders, setOrders] = useState(orderDocs);
  const [selectedItem, setSelectedItem] = useState([]);
  const [processLoading, setProcessLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: itemIsOpen,
    onOpen: itemOnOpen,
    onClose: itemOnClose,
  } = useDisclosure();
  const cancelRef = useRef();

  const [process, setProcess] = useState();

  const openDialog = (order, process) => {
    setSelectedItem(order);

    setProcess(process);
    onOpen();
  };

  const openModal = (order) => {
    setSelectedItem(order);
    itemOnOpen();
  };

  const processOrder = async () => {
    try {
      if (
        user.addresses.length == 0 ||
        user.addresses[0].contactNumber == "" ||
        user.addresses[0].address.no == "" ||
        user.addresses[0].address.street == "" ||
        user.addresses[0].address.barangay == "" ||
        user.addresses[0].address.city == ""
      ) {
        toast({
          title: `Sorry but you can't accept an order yet.`,
          description: `Please properly fill up your info first.`,

          status: "warning",
          duration: 9000,
          isClosable: true,
        });
      } else {
        const courier = {
          name: userSession.name,
          picture: userSession.picture,
          email: userSession.email,
          phone: userSession.addresses[0].contactNumber,
        };

        setProcessLoading(true);
        const indexOfObjectToUpdate = orders.findIndex(
          (obj) => obj.id === selectedItem.id
        );

        const bodyForEmail = await getBodyForEmail(
          "courier-accepted",
          selectedItem.customer,
          userSession
        );

        const response = await axios.post("/api/send-mail", bodyForEmail);

        let status = process == "accept" ? "in-transit" : "order-declined";

        const createNotif = await firestore
          .collection("notifications")
          .doc()
          .set({
            id: selectedItem.customer.id,
            courierId: selectedItem.id,
            orderId: selectedItem.id,
            status: "courier-accepted",
            message:
              "Your order is now in transit. It has been accepted by the courier.",
            date: moment(new Date()).format("MM-DD-YYYY HH:mm"),
          });

        const processResponse = await firestore
          .collection("orders")
          .doc(selectedItem.id)
          .update({
            status: status,
            courier: courier,
            deliveryDate: moment(new Date()).format("MM-DD-YYYY HH:mm"),
          });

        const docRef = firestore.collection("users").doc(user.docId);

        const responseUser = await docRef.update({
          order: selectedItem.id,
        });

        user.order = selectedItem.id;

        const updateSession = await axios.post("/api/auth", {
          user: user,
          role: user.role,
        });

        if (updateSession.status === 200) {
          setProcessLoading(false);
          orders.splice(indexOfObjectToUpdate, 1);
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
          onClose();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AdminLayout
        metaTitle={"Couriers - Available Orders"}
        pageName={"IT Kim - Courier"}
        user={userSession}
        LinkItems={LinkItems}
      >
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>Available Orders</Heading>
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
                  <Tr key={order.id}>
                    <Td>{order.id}</Td>
                    <Td>{moment(new Date()).format("MM/DD/YYYY")}</Td>
                    <Td>{order.customer.name}</Td>
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
                        <>
                          <Button
                            leftIcon={<AiFillCheckCircle />}
                            colorScheme="blue"
                            variant="outline"
                            size={"sm"}
                            onClick={() => {
                              user.order != null || user.order != undefined
                                ? toast({
                                    title: `Sorry but you can't accept an order yet.`,
                                    description: `Please finish your current delivery.`,

                                    status: "warning",
                                    duration: 9000,
                                    isClosable: true,
                                  })
                                : openDialog(order, "accept");
                            }}
                          >
                            Accept
                          </Button>
                        </>
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
                ? "Are you sure you want to accept this order? You will not be able to accept another order until you finish/deliver this order."
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
            <Box>
              <Text fontWeight={"600"} fontSize={"18px"} mb={"12px"}>
                Customer Info
              </Text>
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
              <Text>
                <Text fontWeight={"500"}>Contact Number:</Text>{" "}
                {selectedItem.customer?.address &&
                  selectedItem.customer.address.contactNumber}{" "}
              </Text>
            </Box>
            <Divider h={"3px"} marginBlock={"12px"} />
            <Box>
              <Text fontWeight={"600"} fontSize={"18px"} mb={"12px"}>
                Vendor Info
              </Text>
              <HStack mb={"12px"}>
                <Avatar src={selectedItem.vendorImage} />
                <Box>
                  <Text>{selectedItem.vendor}</Text>
                  <Text>{selectedItem.vendorEmail}</Text>
                </Box>
              </HStack>
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Address:</Text>{" "}
                {selectedItem.vendorAddress &&
                  `${selectedItem.vendorAddress.address.no} ${selectedItem.vendorAddress.address.street} ${selectedItem.vendorAddress.address.barangay} ${selectedItem.vendorAddress.address.city}`}
              </Text>
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Contact Number:</Text>{" "}
                {selectedItem.vendorAddress &&
                  selectedItem.vendorAddress.contactNumber}{" "}
              </Text>
            </Box>

            <Divider h={"3px"} marginBlock={"12px"} />
            <Box>
              <Text fontWeight={"600"} fontSize={"18px"}>
                Items
              </Text>
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
  const userSession = req.session.user;

  if (!userSession) {
    return {
      redirect: {
        permanent: false,
        destination: "/role/courier/auth/login",
      },
    };
  }

  if (userSession.role != "courier") {
    return {
      notFound: true,
    };
  }

  const orderDocs = await getAvailableOrders();

  return {
    props: { orderDocs, userSession },
  };
});
