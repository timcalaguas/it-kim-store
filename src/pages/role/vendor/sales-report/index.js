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
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { MdDeliveryDining, MdPerson } from "react-icons/md";
import moment from "moment/moment";
import { withSessionSsr } from "@/lib/withSession";
import { AiFillShopping } from "react-icons/ai";
import { BsFillCartCheckFill } from "react-icons/bs";

import getAdminOrders from "@/hooks/admin/getAdminOrders";
import getVendorOrders from "@/hooks/vendors/getVendorOrders";
import { FaPesoSign } from "react-icons/fa6";
const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/vendor" },
  { name: "Products", icon: AiFillShopping, link: "/role/vendor/products" },
  { name: "Orders", icon: BsFillCartCheckFill, link: "/role/vendor/orders" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/vendor/sales-report" },
];

const Vendors = ({ orderDocs, user, grandTotalProfit }) => {
  const toast = useToast();

  const [orders, setOrders] = useState(orderDocs);
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

  const openModal = (vendor) => {
    setSelectedItem(vendor);
    itemOnOpen();
  };

  const processVendor = async () => {
    setProcessLoading(true);
    const indexOfObjectToUpdate = vendors.findIndex(
      (obj) => obj.id === selectedItem.id
    );
    let status = process == "accept" ? "approved" : "blocked";
    const processResponse = await firestore
      .collection("users")
      .doc(selectedItem.id)
      .update({ status: status });
    selectedItem.status = status;
    setProcessLoading(false);
    vendors[indexOfObjectToUpdate] = selectedItem;

    toast({
      title: process == "accept" ? "Approved" : "Blocked",
      description:
        process == "accept"
          ? "The vendor is now approved."
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
        metaTitle={"Vendor - Sales Report"}
        pageName={"IT Kim - Vendor"}
        user={user}
        LinkItems={LinkItems}
      >
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>Sales Report</Heading>
        </HStack>

        <Card
          minHeight={"250px"}
          position={"relative"}
          overflow={"hidden"}
          mb={"24px"}
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
                w={{ base: "100%", md: "20%" }}
                minW={{ base: "150px", md: "200px" }}
                minH={"250px"}
                display={"grid"}
                placeItems={"center"}
              >
                <FaPesoSign fontSize={"100px"} fill="#3082CF" />
              </Box>
              <Box padding={"16px"}>
                <Heading color={"#3082CF"}>TOTAL SALES</Heading>
                <Heading size={"4xl"}>{grandTotalProfit}</Heading>
              </Box>
            </Stack>
          </CardBody>
        </Card>
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
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => {
                  return (
                    <Tr key={order.id}>
                      <Td>
                        <HStack>
                          <Text>{order.id}</Text>
                        </HStack>
                      </Td>
                      <Td>{order.subtotal}</Td>
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
                            View Items
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
              <Heading>No vendors yet</Heading>
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
              {process == "accept" ? "Approve Vendor" : "Block Vendor"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {process == "accept"
                ? "Are you sure you want to approve this vendor? This will allow the vendor to publish their products."
                : "Are you sure you want to block this vendor? They will no longer be allowed to use their store and sell products."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={process == "accept" ? "blue" : "red"}
                onClick={() => processVendor()}
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

export default Vendors;

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

  if (user.role != "vendor") {
    return {
      notFound: true,
    };
  }

  let orderDocs = await getVendorOrders(user.docId);
  const receivedItems = orderDocs.filter((item) => item.status == "received" || item.status == "delivered");

  orderDocs = receivedItems;

  const grandTotalProfit = orderDocs.reduce((orderSum, order) => {
    const orderProfit = order.items.reduce((itemSum, item) => {
      const profitPerItem =
        ((item.discountedPrice - item.costDiscountedPrice)) * item.quantity;
      return itemSum + profitPerItem;
    }, 0);
    return orderSum + (order.subtotal - orderProfit);
  }, 0);

  return {
    props: { orderDocs, user, grandTotalProfit },
  };
});
