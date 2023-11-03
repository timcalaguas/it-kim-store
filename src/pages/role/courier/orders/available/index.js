import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../../firebase-config";
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
  Avatar,
  VStack,
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
import { withSessionSsr } from "@/lib/withSession";
import getAvailableOrders from "@/hooks/courier/getAvailableOrders";
import axios from "axios";
import getBodyForEmail from "@/hooks/getBodyForEmail";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/courier" },
  { name: "Orders", icon: FiCompass, link: "/role/courier/orders" },
];

const Orders = ({ orderDocs, userSession }) => {
  const toast = useToast();

  const [orders, setOrders] = useState(orderDocs);
  const [selectedId, setSelectedId] = useState("");
  const [selectedItem, setSelectedItem] = useState([]);
  const [processLoading, setProcessLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: itemIsOpen,
    onOpen: itemOnOpen,
    onClose: itemOnClose,
  } = useDisclosure();
  const cancelRef = useRef();

  const openDeleteDialog = (id) => {
    setSelectedId(id);
    onOpen();
  };

  const openModal = (order) => {
    setSelectedItem(order);
    itemOnOpen();
  };

  const processOrder = async (order, method) => {
    try {
      const courier = {
        name: userSession.name,
        picture: userSession.picture,
        email: userSession.email,
        phone: "",
      };

      setProcessLoading(true);
      const indexOfObjectToUpdate = orders.findIndex(
        (obj) => obj.id === order.id
      );

      const bodyForEmail = await getBodyForEmail(
        "courier-accepted",
        order.customer,
        userSession
      );

      const response = await axios.post("/api/send-mail", bodyForEmail);

      console.log(response);

      let status = method == "accept" ? "in-transit" : "order-declined";

      const processResponse = await firestore
        .collection("orders")
        .doc(order.id)
        .update({ status: status, courier: courier });
      order.status = status;
      setProcessLoading(false);
      orders.splice(indexOfObjectToUpdate, 1);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AdminLayout
        metaTitle={"Vendor - Orders"}
        pageName={"IT Kim - Vendor"}
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
                  <Tr>
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
                            isLoading={processLoading}
                            size={"sm"}
                            onClick={() => processOrder(order, "accept")}
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

  const orderDocs = await getAvailableOrders();

  return {
    props: { orderDocs, userSession },
  };
});
