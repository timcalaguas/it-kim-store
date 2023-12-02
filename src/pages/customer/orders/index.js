import Layout from "@/components/Layout";
import {
  Box,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Heading,
  VStack,
  HStack,
  Text,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Image,
  Button,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Avatar,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { BsBagFill, BsBagCheckFill } from "react-icons/bs";
import { useState, useRef, useEffect } from "react";
import getOrders from "@/hooks/customer/getOrders";
import { withSessionSsr } from "@/lib/withSession";
import RateProductModal from "@/components/RateProductModal";
import StarRatingInput from "@/components/StarRatingInput";
import { MdDeliveryDining } from "react-icons/md";
import { firestore } from "../../../../firebase-config";
import getBodyForEmail from "@/hooks/getBodyForEmail";
import axios from "axios";
import { useDateChecker } from "@/hooks/context/DateCheckerContext";
import updateStarRating from "@/hooks/customer/updateStarRating";

const Orders = ({ user, orders }) => {
  const [result, setResult] = useState(orders);
  const toast = useToast();

  const {
    modalOpen,
    setModalOpen,
    loading,
    handleRatingChange,
    openRatingModal,
    setSelectedProduct,
    rateProduct,
    selectedProduct,
    starRating,
    comment,
    setComment,
  } = RateProductModal(user);

  const {
    handleRatingChange: vendorRatingChange,
    starRating: vendorStarRating,
    comment: vendorComment,
    setComment: vendorSetComment,
  } = RateProductModal(user);

  const {
    handleRatingChange: courierRatingChange,
    starRating: courierStarRating,
    comment: courierComment,
    setComment: courierSetComment,
  } = RateProductModal(user);

  const cancelRef = useRef();

  const [selectedItem, setSelectedItem] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [processLoading, setProcessLoading] = useState(false);
  const [type, setType] = useState("receive");
  const [cancelReason, setCancelReason] = useState("");

  const openDialog = (order, type) => {
    setSelectedItem(order);
    setType(type);
    onOpen();
  };

  const processOrder = async () => {
    try {
      setProcessLoading(true);

      if (type == "receive") {
        const indexOfObjectToUpdate = result.completed.findIndex(
          (obj) => obj.id === selectedItem.id
        );
        let status = "received";
        const vendorResponse = await firestore
          .collection("users")
          .doc(selectedItem.vendorId)
          .get();

        const vendor = vendorResponse.data();
        const bodyForEmail = await getBodyForEmail(
          "received",
          user,
          vendor,
          selectedItem.id
        );

        const response = await axios.post("/api/send-mail", bodyForEmail);

        const processResponse = await firestore
          .collection("orders")
          .doc(selectedItem.id)
          .update({ status: status });

        const vendorRating = await firestore.collection("ratings").doc().set({
          starRating: vendorStarRating,
          comment: vendorComment,
          userEmail: vendor.email,
        });

        const courierRating = await firestore.collection("ratings").doc().set({
          starRating: courierStarRating,
          comment: courierComment,
          userEmail: selectedItem.courier.email,
        });

        const newStarVendor = await updateStarRating(vendor.email);
        const newStarCourier = await updateStarRating(
          selectedItem.courier.email
        );

        result.completed[indexOfObjectToUpdate].status = status;
        setProcessLoading(false);
        toast({
          title: "Order Received",
          description: "You sucessfully marked your order as Received.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        onClose();
      } else {
        let status = "cancelled";
        const indexOfObjectToUpdate = result.orderPlaced.findIndex(
          (obj) => obj.id === selectedItem.id
        );

        const processResponse = await firestore
          .collection("orders")
          .doc(selectedItem.id)
          .update({ status: status, cancelReason: cancelReason });
        setProcessLoading(false);

        result.orderPlaced[indexOfObjectToUpdate].status = status;

        toast({
          title: "Order Cancelled",
          description: "You sucessfully marked your order as Cancelled.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { items, addDateToCheck } = useDateChecker();

  useEffect(() => {
    result.orderPlaced.map((order) => {
      addDateToCheck(order.id, order.date);
    });
  }, []);

  return (
    <Layout metaTitle={"IT Kim - Orders"} user={user}>
      <Box
        maxW={"1440px"}
        marginInline={"auto"}
        minHeight={"100vh"}
        paddingTop={"120px"}
        display={"flex"}
        justifyContent={"center"}
      >
        <Box
          maxWidth={"1000px"}
          paddingBlock={"32px"}
          paddingInline={{ base: "16px", md: "32px" }}
          w={"100%"}
          minH={"500px"}
        >
          <Heading mb={"24px"}>Orders</Heading>
          <Tabs isFitted variant="soft-rounded" colorScheme="orange">
            <TabList
              mb="1em"
              display={"flex"}
              flexDir={{ base: "column", md: "row" }}
            >
              <Tab>
                <HStack minH={"30px"}>
                  <BsBagFill fontSize={"25px"} />
                  <Text>Order Placed</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack minH={"30px"}>
                  <MdDeliveryDining fontSize={"25px"} />
                  <Text>In Transit</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack minH={"30px"}>
                  <BsBagCheckFill fontSize={"25px"} />
                  <Text>Delivered</Text>
                </HStack>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack w={"100%"}>
                  <Accordion allowToggle w={"100%"}>
                    {result.orderPlaced.map((order, index) => {
                      console.log(items[index]);
                      return (
                        <Order
                          order={order}
                          withinTen={
                            items.length > 0
                              ? items[index].isWithin10Minutes
                              : false
                          }
                          open={openRatingModal}
                          openDialog={openDialog}
                        />
                      );
                    })}
                  </Accordion>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack w={"100%"}>
                  <Accordion allowToggle w={"100%"}>
                    {result.inTransit.map((order) => (
                      <Order
                        order={order}
                        open={openRatingModal}
                        openDialog={openDialog}
                      />
                    ))}
                  </Accordion>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack w={"100%"}>
                  <Accordion allowToggle w={"100%"}>
                    {result.completed.map((order) => (
                      <Order
                        order={order}
                        open={openRatingModal}
                        openDialog={openDialog}
                      />
                    ))}
                  </Accordion>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Rate {modalOpen ? selectedProduct.productName : ""}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            flexDirection={"column"}
            alignItems={"start"}
            gap={"24px"}
          >
            <FormControl>
              <FormLabel>Rating</FormLabel>
              <StarRatingInput
                rating={starRating}
                onRatingChange={handleRatingChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Comment</FormLabel>
              <Textarea
                onChange={(e) => setComment(e.target.value)}
                value={comment}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="primary" onClick={rateProduct} isLoading={loading}>
              Rate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {type == "receive" ? "Receive Order?" : "Cancel Order"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {type == "receive"
                ? "Are you sure you want to mark this order as Received? The vendor will be notified that you received the order."
                : "Are you sure you want to cancel this order? "}
              {type == "receive" ? (
                <>
                  <Divider marginBlock={"12px"} />
                  <Box>
                    <Text fontWeight={"600"} fontSize={"18px"} mb={"12px"}>
                      Vendor Rating
                    </Text>
                    <FormControl>
                      <FormLabel>Rating</FormLabel>
                      <StarRatingInput
                        rating={vendorStarRating}
                        onRatingChange={vendorRatingChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Comment</FormLabel>
                      <Textarea
                        onChange={(e) => vendorSetComment(e.target.value)}
                        value={vendorComment}
                      />
                    </FormControl>
                  </Box>
                  <Divider marginBlock={"12px"} />
                  <Box>
                    <Text fontWeight={"600"} fontSize={"18px"} mb={"12px"}>
                      Courier Rating
                    </Text>
                    <FormControl>
                      <FormLabel>Rating</FormLabel>
                      <StarRatingInput
                        rating={courierStarRating}
                        onRatingChange={courierRatingChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Comment</FormLabel>
                      <Textarea
                        onChange={(e) => courierSetComment(e.target.value)}
                        value={courierComment}
                      />
                    </FormControl>
                  </Box>
                </>
              ) : (
                <>
                  <Divider marginBlock={"12px"} />
                  <FormControl>
                    <FormLabel>Cancel Reason</FormLabel>
                    <Textarea
                      onChange={(e) => setCancelReason(e.target.value)}
                      value={cancelReason}
                    />
                  </FormControl>
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              {type == "receive" ? (
                <Button
                  colorScheme={"blue"}
                  onClick={() => processOrder()}
                  ml={3}
                  isLoading={processLoading}
                >
                  Receive
                </Button>
              ) : (
                <Button
                  colorScheme={"red"}
                  onClick={() => processOrder()}
                  ml={3}
                  isLoading={processLoading}
                  disabled={cancelReason == ""}
                >
                  Cancel Order
                </Button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
};

const Order = ({ order, withinTen, open, openDialog }) => {
  let total = 0;
  return (
    <AccordionItem key={order.id}>
      <h2>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left" fontWeight={"700"}>
            <Tag
              textTransform={"uppercase"}
              mr={"8px"}
              colorScheme={
                order.status == "order-declined" || order.status == "cancelled"
                  ? "red"
                  : order.status == "delivered" || order.status == "received"
                  ? "green"
                  : "blue"
              }
            >
              {order.status.replace("-", " ")}
            </Tag>
            Order {order.id.slice(0, 4)}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <Box>
          <HStack
            mb={"16px"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Text fontWeight={"500"} fontSize={"18px"}>
              {order.vendor}
            </Text>

            {order.status === "delivered" && (
              <Button
                size={"sm"}
                colorScheme="green"
                onClick={() => openDialog(order)}
              >
                Received?
              </Button>
            )}
            {order.status === "order-placed" && withinTen && (
              <Button
                size={"sm"}
                colorScheme="red"
                onClick={() => openDialog(order)}
              >
                Cancel Order?
              </Button>
            )}
          </HStack>
          <Box>
            <Text mb={"12px"} fontWeight={"500"} fontSize={"14px"}>
              Items
            </Text>
            <VStack alignItems={"start"} gap={"10px"}>
              {order.items.map((item) => {
                total = total + item.quantity * item.discountedPrice;
                return (
                  <HStack
                    flexWrap={"wrap"}
                    w={"100%"}
                    justifyContent={"space-between"}
                  >
                    <HStack gap={"4px"} w={"50%"} flexWrap={"wrap"}>
                      <Image
                        src={item.image}
                        boxSize={"65px"}
                        borderRadius={"lg"}
                      />
                      <VStack alignItems={"start"}>
                        <Text fontSize={"md"} fontWeight={"medium"}>
                          {item.productName}
                        </Text>
                        {(item.rated == false || item.rated == undefined) &&
                          order.status == "delivered" && (
                            <Button
                              size={"sm"}
                              variant={"link"}
                              _hover={{
                                background: "transparent",
                                textDecor: "underline",
                              }}
                              onClick={() => {
                                open(item, order.id);
                              }}
                            >
                              Rate Product
                            </Button>
                          )}
                      </VStack>
                    </HStack>
                    <Text fontSize={"md"}>
                      {item.quantity} x {item.discountedPrice}
                    </Text>
                  </HStack>
                );
              })}
              {(order.status == "in-transit" ||
                order.status == "delivered" ||
                order.status == "received") && (
                <Box>
                  <Text fontWeight={"600"} fontSize={"14px"} mb={"12px"}>
                    Courier
                  </Text>
                  <HStack mb={"12px"}>
                    <Avatar src={order.courier?.picture} />
                    <Box fontSize={"14px"}>
                      <Text>{order.courier?.name}</Text>
                      <Text>{order.courier?.email}</Text>
                      <Text>{order.courier?.contactNumber}</Text>
                    </Box>
                  </HStack>
                </Box>
              )}
              <HStack
                justifyContent={"space-between"}
                w={"100%"}
                flexWrap={"wrap"}
                alignItems={"start"}
              >
                <VStack
                  mt={"12px"}
                  w={{ base: "100%", md: "auto" }}
                  flexWrap={"wrap"}
                  justifyContent={"start"}
                  alignItems={"start"}
                >
                  <Text fontSize={"md"} fontWeight={"600"}>
                    Order Time: {order.date}
                  </Text>
                  {order.status != "order-placed" &&
                    order.status != "order-accepted" &&
                    order.status != "order-declined" && (
                      <Text fontSize={"md"} fontWeight={"600"}>
                        Ship Time: {order.deliveryDate}
                      </Text>
                    )}
                  {order.status != "order-placed" &&
                    order.status != "order-accepted" &&
                    order.status != "order-declined" &&
                    order.status != "in-transit" && (
                      <Text fontSize={"md"} fontWeight={"600"}>
                        Delivered Time: {order.completedDate}
                      </Text>
                    )}
                </VStack>
                <VStack
                  w={{ base: "100%", md: "auto" }}
                  mt={"12px"}
                  flexWrap={"wrap"}
                  justifyContent={"end"}
                  alignItems={{ base: "start", md: "end" }}
                >
                  <Text fontSize={"md"} fontWeight={"600"}>
                    Payment Method: {order.paymentMethod}
                  </Text>
                  <Text fontSize={"md"} fontWeight={"600"}>
                    Subtotal: {order.subtotal}
                  </Text>
                  <Text fontSize={"md"} fontWeight={"600"}>
                    {order.deliveryFee == 0
                      ? "FREE DELIVERY"
                      : `Delivery fee: ${order.deliveryFee}`}
                  </Text>
                  <Text fontSize={"md"} fontWeight={"600"}>
                    Total: {order.total}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default Orders;

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const user = req.session.user ? req.session.user : null;

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  if (user.role != "customer") {
    return {
      notFound: true,
    };
  }

  const orders = await getOrders(user.docId);

  return {
    props: { user, orders },
  };
});
