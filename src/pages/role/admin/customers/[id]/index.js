import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../../firebase-config";
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
import Link from "next/link";
import { BiSolidShoppingBag } from "react-icons/bi";
import { FaPesoSign } from "react-icons/fa6";
import getCustomerOrders from "@/hooks/admin/getCustomerOrders";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/admin" },
  { name: "Vendors", icon: AiFillShop, link: "/role/admin/vendors" },
  { name: "Couriers", icon: MdDeliveryDining, link: "/role/admin/couriers" },
  { name: "Customers", icon: MdPerson, link: "/role/admin/customers" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/admin/sales-report" },
];

const Couriers = ({ orderDocs, user, customerDoc }) => {
  const toast = useToast();

  const [orders, setOrders] = useState(orderDocs);
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
          <Heading>{customerDoc.name}'s Orders</Heading>
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
                  <Th>Vendor</Th>
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
                      <Td>{order.completedDate}</Td>
                      <Td>{order.vendor}</Td>
                      <Td>{order.total}</Td>
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
            {selectedItem.courier && (
              <>
                <Box>
                  <Text fontWeight={"600"} fontSize={"18px"} mb={"12px"}>
                    Courier Info
                  </Text>
                  <HStack mb={"12px"}>
                    <Avatar src={selectedItem.courier?.picture} />
                    <Box>
                      <Text>{selectedItem.courier?.name}</Text>
                      <Text>{selectedItem.courier?.email}</Text>
                    </Box>
                  </HStack>

                  <Text>
                    <Text fontWeight={"500"}>Contact Number:</Text>{" "}
                    {selectedItem.courier?.phone && selectedItem.courier.phone}{" "}
                  </Text>
                </Box>
                <Divider h={"3px"} marginBlock={"12px"} />
              </>
            )}

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

export default Couriers;

export const getServerSideProps = withSessionSsr(async (context) => {
  const { req } = context;
  const user = req.session.user;

  const { id } = context.params;

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

  const { orderDocs, customerDoc } = await getCustomerOrders(id);

  return {
    props: { orderDocs, user, customerDoc },
  };
});
