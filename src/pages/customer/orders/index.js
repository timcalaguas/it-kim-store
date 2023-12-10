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
  Input,
  Divider,
  FormErrorMessage,
} from "@chakra-ui/react";
import { BsBagFill, BsBagCheckFill } from "react-icons/bs";
import { useState, useRef, useEffect } from "react";
import getOrders from "@/hooks/customer/getOrders";
import { withSessionSsr } from "@/lib/withSession";
import RateProductModal from "@/components/RateProductModal";
import StarRatingInput from "@/components/StarRatingInput";
import { MdDeliveryDining } from "react-icons/md";
import { firestore, storage } from "../../../../firebase-config";
import getBodyForEmail from "@/hooks/getBodyForEmail";
import axios from "axios";
import { useDateChecker } from "@/hooks/context/DateCheckerContext";
import updateStarRating from "@/hooks/customer/updateStarRating";
import moment from "moment";
import { useForm } from "react-hook-form";

const Orders = ({ user, orders }) => {
  const storageRef = storage.ref();

  const [result, setResult] = useState(orders);
  const toast = useToast();

  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const [qrImage, setQRImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const selectedFile = watch("receipt");

  useEffect(() => {
    if (selectedFile?.length > 0) {
      setPreviewImage(selectedFile[0]);
    }
  }, [selectedFile]);

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

  console.log(orders);
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

        const createNotif = await firestore
          .collection("notifications")
          .doc()
          .set({
            id: selectedItem.vendorId,
            orderId: selectedItem.id,
            status: "received",
            message: "The customer already received the order",
            date: moment(new Date()).format("MM-DD-YYYY HH:mm"),
          });

        const response = await axios.post("/api/send-mail", bodyForEmail);

        const processResponse = await firestore
          .collection("orders")
          .doc(selectedItem.id)
          .update({ status: status });

        const vendorRating = await firestore.collection("ratings").doc().set({
          orderId: selectedItem.id,
          starRating: vendorStarRating,
          comment: vendorComment,
          userEmail: vendor.email,
        });

        const courierRating = await firestore.collection("ratings").doc().set({
          orderId: selectedItem.id,
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

  const submitPayment = async (values) => {
    if (type == "pay") {
      setProcessLoading(true);
      const indexOfObjectToUpdate = result.orderPlaced.findIndex(
        (obj) => obj.id === selectedItem.id
      );
      let status = "paid";
      const vendorResponse = await firestore
        .collection("users")
        .doc(selectedItem.vendorId)
        .get();

      const vendor = vendorResponse.data();

      const bodyForEmail = await getBodyForEmail(
        "paid",
        user,
        vendor,
        selectedItem.id
      );

      let downloadURL;

      if (values.receipt.length > 0) {
        const productImageName = values.receipt[0]?.name;

        const imageRef = storageRef.child(`images/${productImageName}`);
        const file = values.receipt[0];

        const snapshot = await imageRef.put(file);

        downloadURL = await imageRef.getDownloadURL();
      }

      const createNotif = await firestore
        .collection("notifications")
        .doc()
        .set({
          id: selectedItem.vendorId,
          orderId: selectedItem.id,
          status: "paid",
          message: "The customer paid for the order. Please confirm it",
          date: moment(new Date()).format("MM-DD-YYYY HH:mm"),
        });

      const response = await axios.post("/api/send-mail", bodyForEmail);

      const processResponse = await firestore
        .collection("orders")
        .doc(selectedItem.id)
        .update({ status: status, receipt: downloadURL });

      result.orderPlaced[indexOfObjectToUpdate].status = status;
      setProcessLoading(false);
      toast({
        title: "Order Paid",
        description: "You sucessfully marked your order as Paid.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      onClose();
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
              {type == "receive"
                ? "Receive Order?"
                : type == "pay"
                ? "Pay thru GCash QR"
                : "Cancel Order"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {type == "receive"
                ? "Are you sure you want to mark this order as Received? The vendor will be notified that you received the order."
                : type == "pay"
                ? "Please upload your GCash Receipt so that the seller can confirm it."
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
              ) : type == "pay" ? (
                <form onSubmit={handleSubmit(submitPayment)}>
                  <Divider marginBlock={"12px"} />

                  <Image
                    src={selectedItem.qr}
                    width={"70%"}
                    marginInline={"auto"}
                    mb={"14px"}
                  />
                  <Text
                    marginInline={"auto"}
                    textAlign={"center"}
                    mb={"24px"}
                    fontWeight={"700"}
                  >
                    Total Amount: {selectedItem.total}
                  </Text>
                  <Box
                    display={"flex"}
                    flexDirection={"start"}
                    w={"100%"}
                    gap={"24px"}
                    flexWrap={"wrap"}
                    mb="12px"
                  >
                    {previewImage != "" ? (
                      <Image
                        id="preview"
                        marginInline={"auto"}
                        objectFit={"contain"}
                        src={
                          selectedFile?.length > 0
                            ? URL.createObjectURL(selectedFile[0])
                            : "https://placehold.co/400x400"
                        }
                        boxSize={{ base: "100%", sm: "200px" }}
                      />
                    ) : (
                      <Image
                        id="preview"
                        marginInline={"auto"}
                        objectFit={"contain"}
                        src={"https://placehold.co/400x400"}
                        boxSize={{ base: "100%", sm: "200px" }}
                      />
                    )}

                    <FormControl
                      isInvalid={errors.receipt}
                      w={{ base: "100%", sm: "fit-content" }}
                    >
                      <FormLabel htmlFor="name">Upload GCash Receipt</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        {...register("receipt", {
                          validate: (value) => {
                            const types = [
                              "image/png",
                              "image/jpeg",
                              "image/jpg",
                            ];
                            if (value.length > 0) {
                              if (!types.includes(value[0]?.type)) {
                                return "Invalid file format. Only JPG and PNG are allowed.";
                              }

                              if (value[0]?.size > 5242880) {
                                return "File is too large. Upload images with a size of 5MB or below.";
                              }
                            }

                            return true;
                          },
                        })}
                      />
                      <FormErrorMessage>
                        {errors.receipt && errors.receipt.message}
                      </FormErrorMessage>
                    </FormControl>
                  </Box>
                  <HStack justifyContent={"end"} paddingBlock="16px">
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme={"blue"}
                      type={"submit"}
                      ml={3}
                      isLoading={processLoading}
                    >
                      Pay
                    </Button>
                  </HStack>
                </form>
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
            {type != "pay" && (
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
            )}
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
                onClick={() => openDialog(order, "receive")}
              >
                Received?
              </Button>
            )}
            {order.status === "order-placed" && withinTen && (
              <Button
                size={"sm"}
                colorScheme="red"
                onClick={() => openDialog(order, "cancel")}
              >
                Cancel Order?
              </Button>
            )}

            {order.status === "payment-needed" && (
              <Button
                size={"sm"}
                colorScheme="blue"
                onClick={() => openDialog(order, "pay")}
              >
                Pay?
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
                  {order.status == "cancelled" && (
                    <Text fontSize={"md"} fontWeight={"600"}>
                      Cancel Reason: {order.cancelReason}
                    </Text>
                  )}
                  <Text fontSize={"md"} fontWeight={"600"}>
                    Order Time: {order.date}
                  </Text>
                  {order.status != "order-placed" &&
                    order.status != "order-accepted" &&
                    order.status != "order-declined" &&
                    order.status != "cancelled" && (
                      <Text fontSize={"md"} fontWeight={"600"}>
                        Ship Time: {order.deliveryDate}
                      </Text>
                    )}
                  {order.status != "order-placed" &&
                    order.status != "order-accepted" &&
                    order.status != "order-declined" &&
                    order.status != "in-transit" &&
                    order.status != "cancelled" && (
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
