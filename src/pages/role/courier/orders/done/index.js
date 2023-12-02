import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../../firebase-config";
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
  VStack,
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
  Flex,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import moment from "moment/moment";
import getDeliveredOrders from "@/hooks/courier/getDeliveredOrders";
import { withSessionSsr } from "@/lib/withSession";
import Link from "next/link";
import { BsFillCartFill } from "react-icons/bs";
import { BsCartCheckFill } from "react-icons/bs";
import { FaPesoSign } from "react-icons/fa6";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/courier" },
  {
    name: "Available Orders",
    icon: FiCompass,
    link: "/role/courier/orders/available",
  },
  { name: "Finished Orders", icon: FiStar, link: "/role/courier/orders/done" },
];
const Orders = ({ orderDocs, userSession, grandTotalProfit }) => {
  const toast = useToast();

  const [orders, setOrders] = useState(orderDocs);
  const [selectedId, setSelectedId] = useState("");
  const [selectedItem, setSelectedItem] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: itemIsOpen,
    onOpen: itemOnOpen,
    onClose: itemOnClose,
  } = useDisclosure();
  const cancelRef = useRef();

  const openModal = (order) => {
    setSelectedItem(order);
    itemOnOpen();
  };

  const processOrder = async (order, method) => {
    setProcessLoading(true);
    const indexOfObjectToUpdate = orders.findIndex(
      (obj) => obj.id === order.id
    );
    let status = method == "accept" ? "courier-accepted" : "order-declined";
    const processResponse = await firestore
      .collection("orders")
      .doc(order.id)
      .update({ status: status });
    order.status = status;
    setProcessLoading(false);
    order[indexOfObjectToUpdate] = order;
  };

  return (
    <>
      <AdminLayout
        metaTitle={"Couriers - Finished Orders"}
        pageName={"IT Kim - Courier"}
        user={userSession}
        LinkItems={LinkItems}
      >
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>Finished Orders</Heading>
        </HStack>

        <Flex
          gap={4}
          justifyContent={"space-between"}
          flexWrap={"wrap"}
          mb={"24px"}
        >
          <Card
            w={"100%"}
            minHeight={"250px"}
            position={"relative"}
            overflow={"hidden"}
          >
            <CardBody p={0}>
              <Stack
                height={"full"}
                alignItems={"start"}
                flexDirection={{ base: "column", md: "row" }}
              >
                <Box
                  bg={"gray.100"}
                  height={"100%"}
                  w={{ base: "100%", md: "auto" }}
                  minW={{ base: "150px", md: "200px" }}
                  display={"grid"}
                  placeItems={"center"}
                >
                  <FaPesoSign fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>TOTAL INCOME</Heading>
                  <Heading size={"4xl"}>{grandTotalProfit}</Heading>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </Flex>

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
                  <Th>Vendor</Th>
                  <Th>Total</Th>
                  <Th>Delivery Fee</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => {
                  return (
                    <Tr>
                      <Td>{order.id}</Td>
                      <Td>{moment(new Date()).format("MM/DD/YYYY")}</Td>
                      <Td>{order.vendor}</Td>
                      <Td>{order.total}</Td>
                      <Td>{order.deliveryFee}</Td>
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
                        </Stack>
                      </Td>
                    </Tr>
                  );
                })}
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

  const orderDocs = await getDeliveredOrders(userSession.email);

  const grandTotalProfit = orderDocs.reduce((orderSum, order) => {
    return orderSum + order.deliveryFee;
  }, 0);

  return {
    props: { orderDocs, userSession, grandTotalProfit },
  };
});
