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
} from "@chakra-ui/react";
import { BsBagFill, BsBagCheckFill } from "react-icons/bs";
import { useState, useRef } from "react";
import getOrders from "@/hooks/customer/getOrders";
import { withSessionSsr } from "@/lib/withSession";
import RateProductModal from "@/components/RateProductModal";
import StarRatingInput from "@/components/StarRatingInput";
import { MdDeliveryDining } from "react-icons/md";
import { firestore } from "../../../../firebase-config";
import getBodyForEmail from "@/hooks/getBodyForEmail";
import axios from "axios";

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

  const cancelRef = useRef();

  const [selectedItem, setSelectedItem] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [processLoading, setProcessLoading] = useState(false);

  const openDialog = (order) => {
    setSelectedItem(order);
    onOpen();
  };

  const processOrder = async () => {
    try {
      setProcessLoading(true);
      const indexOfObjectToUpdate = result.completed.findIndex(
        (obj) => obj.id === selectedItem.id
      );

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

      let status = "received";

      const processResponse = await firestore
        .collection("orders")
        .doc(selectedItem.id)
        .update({ status: status });

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
    } catch (error) {
      console.log(error);
    }
  };

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
                    {result.orderPlaced.map((order) => (
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
              Receive Order?
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to mark this order as Received? The vendor
              will be notified that you received the order.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={"blue"}
                onClick={() => processOrder()}
                ml={3}
                isLoading={processLoading}
              >
                Receive
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
};

const Order = ({ order, open, openDialog }) => {
  let total = 0;
  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left" fontWeight={"700"}>
            <Tag
              textTransform={"uppercase"}
              mr={"8px"}
              colorScheme={
                order.status == "order-declined"
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
                        {item.rated == false ||
                          (item.rated == undefined && (
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
                          ))}
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
              <VStack
                mt={"12px"}
                flexWrap={"wrap"}
                w={"100%"}
                justifyContent={"end"}
                alignItems={"end"}
              >
                <Text fontSize={"md"} fontWeight={"600"}>
                  Payment Method: {order.paymentMethod}
                </Text>
                <Text fontSize={"md"} fontWeight={"600"}>
                  Subtotal: {order.subtotal}
                </Text>
                <Text fontSize={"md"} fontWeight={"600"}>
                  Shipping fee: 30
                </Text>
                <Text fontSize={"md"} fontWeight={"600"}>
                  Total: {order.total}
                </Text>
              </VStack>
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
