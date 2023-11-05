import AdminLayout from "@/components/AdminLayout";
import {
  Box,
  Heading,
  Text,
  Flex,
  Image,
  Card,
  CardBody,
  CardHeader,
  Stack,
  HStack,
  Tag,
  VStack,
  Avatar,
  Button,
  TagLabel,
  useDisclosure,
  Alert,
  AlertIcon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalOverlay,
  FormControl,
  FormLabel,
  Input,
  Divider,
  ModalFooter,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import { withSessionSsr } from "@/lib/withSession";
import Link from "next/link";
import {
  BsCartCheckFill,
  BsFillCartCheckFill,
  BsFillCartFill,
} from "react-icons/bs";
import getCourierDashboardCount from "@/hooks/courier/getCourierDashboardCount";
import getCurrentOrder from "@/hooks/courier/getCurrentOrder";
import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { firestore } from "../../../../firebase-config";
import axios from "axios";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/courier" },
  {
    name: "Available Orders",
    icon: FiCompass,
    link: "/role/courier/orders/available",
  },
  { name: "Finished Orders", icon: FiStar, link: "/role/courier/orders/done" },
];

const Courier = ({
  userSession,
  availableOrderCount,
  finishedOrderCount,
  order,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: dialogIsOpen,
    onOpen: dialogOnOpen,
    onClose: dialogClose,
  } = useDisclosure();
  const { register, handleSubmit, errors, isSubmitting } = useForm();
  const [user, setUser] = useState(userSession);
  const toast = useToast();
  const [doneCount, setDoneCount] = useState(finishedOrderCount);

  async function updateProfile(values) {
    try {
      const addresses = [
        {
          address: {
            no: values.no,
            street: values.street,
            barangay: values.barangay,
            city: values.city,
          },
          contactNumber: values.contactNumber,
        },
      ];

      user.addresses = addresses;

      const response = await firestore
        .collection("users")
        .doc(user.docId)
        .update({
          addresses: addresses,
        });

      const updateSession = await axios.post("/api/auth", {
        user: user,
        role: user.role,
      });

      if (!isSubmitting && updateSession.status == 200) {
        toast({
          title: "User Profile updated.",
          description: "Your user profile is successfully updated.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setUser(user);
        onClose();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const [type, setType] = useState("");
  const [selectedItem, setSelectedItem] = useState({});
  const cancelRef = useRef();
  const [processLoading, setProcessLoading] = useState(false);

  const openModal = (type, order) => {
    if (type === "update") {
      onOpen();
      setType(type);
    } else {
      onOpen();
      setType(type);
      setSelectedItem(order);
    }
  };

  const openDialog = (order) => {
    dialogOnOpen();
    setSelectedItem(order);
  };

  const processOrder = async () => {
    try {
      setProcessLoading(true);

      const processResponse = await firestore
        .collection("orders")
        .doc(selectedItem.id)
        .update({ status: "delivered" });

      const docRef = firestore.collection("users").doc(user.docId);

      const responseUser = await docRef.update({
        order: null,
      });

      user.order = null;

      const updateSession = await axios.post("/api/auth", {
        user: user,
        role: user.role,
      });

      setUser(user);

      if (updateSession.status === 200) {
        setProcessLoading(false);
        toast({
          title: "Order is Delivered",
          description: "The order is now delivered. Thank you.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        dialogClose();
        setDoneCount(doneCount + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AdminLayout
      metaTitle={"Courier - Dashboard"}
      pageName="IT- Kim - Courier"
      user={user}
      LinkItems={LinkItems}
    >
      <Box>
        {user.addresses == null && (
          <Alert status="warning" mb={"20px"}>
            <AlertIcon />
            <HStack
              marginLeft={"12px"}
              justifyContent={"space-between"}
              w={"100%"}
              flexWrap={"wrap"}
            >
              <Text>Please provide your store details</Text>
              <Button
                variant={"primary"}
                size={"sm"}
                onClick={() => openModal("update", {})}
              >
                Update Profile
              </Button>
            </HStack>
          </Alert>
        )}{" "}
        <Flex
          gap={4}
          justifyContent={"space-between"}
          flexWrap={"wrap"}
          mt={"24px"}
          alignItems={"stretch"}
        >
          <Card
            minW={{ base: "100%", xl: "320px" }}
            w={{ base: "100%", xl: "48%" }}
            h={"100%"}
          >
            <CardBody position={"relative"} overflow={"hidden"}>
              <HStack gap={"24px"} flexWrap={"wrap"}>
                <VStack marginInline={{ base: "auto", md: "0" }}>
                  <Avatar
                    src={user.storeLogo}
                    name={user.storeName}
                    boxSize={"200px"}
                  />
                  <Tag
                    size="lg"
                    colorScheme={
                      user.status === "approved" ? "green" : "orange"
                    }
                    borderRadius="full"
                    marginBlock={"12px"}
                  >
                    {user.status === "approved" ? (
                      <TagLabel textTransform={"uppercase"}>
                        {user.status}
                      </TagLabel>
                    ) : (
                      <TagLabel textTransform={"uppercase"}>Pending</TagLabel>
                    )}
                  </Tag>
                  <Button
                    colorScheme="blue"
                    onClick={() => openModal("update", {})}
                  >
                    Update Profile
                  </Button>
                </VStack>
                <Box>
                  <Box mb={"12px"}>
                    <Text fontWeight={"bold"}>Name:</Text>
                    <Text>{user.name}</Text>
                  </Box>
                  <Box mb={"12px"}>
                    <Text fontWeight={"bold"}>Address:</Text>
                    <Text>
                      {user.addresses?.length > 0
                        ? `${user.addresses[0].address.no} ${user.addresses[0].address.street} ${user.addresses[0].address.barangay} ${user.addresses[0].address.city}`
                        : ""}
                    </Text>
                  </Box>
                  <Box mb={"12px"}>
                    <Text fontWeight={"bold"}>Contact No.:</Text>
                    <Text>
                      {user.addresses?.length > 0
                        ? user.addresses[0].contactNumber
                        : ""}
                    </Text>
                  </Box>

                  <Box mb={"12px"}>
                    <Text fontWeight={"bold"}>Email:</Text>
                    <Text>{user.email}</Text>
                  </Box>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card
            minW={{ base: "100%", xl: "320px" }}
            w={{ base: "100%", xl: "48%" }}
          >
            <CardBody>
              <HStack justifyContent={"space-between"}>
                <Text mb="12px" fontWeight={"700"} fontSize={"2xl"}>
                  Current Delivery
                </Text>
                {order != null && (
                  <Button
                    colorScheme={"blue"}
                    onClick={() => openDialog(order)}
                  >
                    Delivered?
                  </Button>
                )}
              </HStack>
              {order != null ? (
                <Box>
                  <Text fontWeight={"600"} mb={"12px"}>
                    Order
                  </Text>
                  <HStack flexWrap={"wrap"} alignItems={"start"}>
                    <Box p={2} border={"1px"} borderColor={"gray.100"}>
                      <Text fontWeight={"900"}>Customer Info</Text>
                      <Text>
                        <b>Name:</b> {order.customer.name}
                      </Text>
                      <Text>
                        <b>Address:</b> {order.customer.address.address.no}{" "}
                        {order.customer.address.address.street}{" "}
                        {order.customer.address.address.barangay}{" "}
                        {order.customer.address.address.city}
                      </Text>
                      <Text>
                        <b>Email:</b> {order.customer.email}
                      </Text>
                      <Text>
                        <b>Phone Number:</b>{" "}
                        {order.customer.address.contactNumber}
                      </Text>
                    </Box>
                    <Box p={2} border={"1px"} borderColor={"gray.100"}>
                      <Text mb={"12px"}>
                        <b>Vendor Name:</b> {order.vendor}
                      </Text>
                      <Button
                        colorScheme="orange"
                        size={"sm"}
                        onClick={() => openModal("view-items", order)}
                      >
                        View Items
                      </Button>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Box
                  display={"grid"}
                  placeItems={"center"}
                  gap={"12px"}
                  height={"100%"}
                >
                  <Box display={"grid"} placeItems={"center"} gap={"12px"}>
                    <Text fontWeight={"700"} fontSize={"3xl"}>
                      No Order accepted yet
                    </Text>
                    <Button
                      as={Link}
                      href="/role/courier/orders/available"
                      colorScheme="blue"
                      _hover={{ textDecor: "none" }}
                    >
                      View Available Orders
                    </Button>
                  </Box>
                </Box>
              )}
            </CardBody>
          </Card>
        </Flex>
        <Flex
          gap={4}
          justifyContent={"space-between"}
          flexWrap={"wrap"}
          mt={"24px"}
        >
          <Card
            minW={{ base: "100%", xl: "320px" }}
            w={{ base: "100%", xl: "48%" }}
            minHeight={"250px"}
            position={"relative"}
            overflow={"hidden"}
            as={Link}
            href="/role/courier/orders/available"
            _hover={{ textDecor: "none" }}
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
                  <BsFillCartFill fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>AVAILABLE ORDERS</Heading>
                  <Heading size={"4xl"}>{availableOrderCount}</Heading>
                </Box>
              </Stack>
            </CardBody>
          </Card>
          <Card
            minW={{ base: "100%", xl: "320px" }}
            w={{ base: "100%", xl: "48%" }}
            minHeight={"250px"}
            position={"relative"}
            overflow={"hidden"}
            as={Link}
            href="/role/courier/orders/done"
            _hover={{ textDecor: "none" }}
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
                  <BsCartCheckFill fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>FINISHED ORDERS</Heading>
                  <Heading size={"4xl"}>{doneCount}</Heading>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </Flex>
      </Box>
      <AlertDialog
        isOpen={dialogIsOpen}
        leastDestructiveRef={cancelRef}
        onClose={dialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Order is delivered?
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you already delivered the order and the customer have
              accepted it?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={dialogClose}>
                Cancel
              </Button>
              <Button
                colorScheme={"blue"}
                onClick={() => processOrder()}
                ml={3}
                isLoading={processLoading}
              >
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
        <ModalOverlay />
        <form onSubmit={handleSubmit(updateProfile)}>
          <ModalContent>
            <ModalHeader>
              {type === "update" ? "Update Profile" : "Order Items"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {type === "update" ? (
                <>
                  <FormControl>
                    <FormLabel>Contact Number</FormLabel>
                    <Input type="text" {...register("contactNumber")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>House No. / Blk No. / Lot No.</FormLabel>
                    <Input type="text" {...register("no")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Street</FormLabel>
                    <Input type="text" {...register("street")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Barangay</FormLabel>
                    <Input type="text" {...register("barangay")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>City</FormLabel>
                    <Input type="text" {...register("city")} />
                  </FormControl>
                </>
              ) : (
                <>
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
                              <Text fontSize={"md"}>
                                {item.discountedPrice}
                              </Text>
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
                </>
              )}
            </ModalBody>
            {type === "update" && (
              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  Update
                </Button>
              </ModalFooter>
            )}
          </ModalContent>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default Courier;

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

  let order = null;

  if (userSession.order != null && userSession.order != undefined) {
    order = await getCurrentOrder(userSession.order);
  }

  const { availableOrderCount, finishedOrderCount } =
    await getCourierDashboardCount();

  return {
    props: { userSession, availableOrderCount, finishedOrderCount, order },
  };
});
