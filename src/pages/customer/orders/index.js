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
} from "@chakra-ui/react";
import { BsBagFill, BsBagCheckFill } from "react-icons/bs";
import { BiSolidTruck } from "react-icons/bi";
import { getSession } from "next-auth/react";
import { firestore } from "../../../../firebase-config";

const Orders = ({ userSession, result }) => {
  return (
    <Layout metaTitle={"IT Kim - Orders"}>
      <Box
        maxW={"1440px"}
        marginInline={"auto"}
        minHeight={"100vh"}
        paddingTop={"120px"}
        display={"flex"}
        justifyContent={"center"}
      >
        <Box maxWidth={"1000px"} padding={"32px"} w={"100%"} minH={"500px"}>
          <Heading mb={"24px"}>Orders</Heading>
          <Tabs isFitted variant="soft-rounded" colorScheme="orange">
            <TabList mb="1em">
              <Tab>
                <VStack minH={"50px"}>
                  <BsBagFill fontSize={"25px"} />
                  <Text>Order Placed</Text>
                </VStack>
              </Tab>
              <Tab>
                <VStack minH={"50px"}>
                  <BiSolidTruck fontSize={"25px"} />
                  <Text>In Transit</Text>
                </VStack>
              </Tab>
              <Tab>
                <VStack minH={"50px"}>
                  <BsBagCheckFill fontSize={"25px"} />
                  <Text>Order Received</Text>
                </VStack>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack w={"100%"}>
                  <Accordion allowToggle w={"100%"}>
                    {result.orderPlaced.map((order) => {
                      let total = 0;
                      return (
                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box
                                as="span"
                                flex="1"
                                textAlign="left"
                                fontWeight={"700"}
                              >
                                Order {order.id}
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <Box>
                              <Box mb={"16px"}>
                                <Text fontWeight={"500"}>{order.vendor}</Text>
                                <Text></Text>
                              </Box>
                              <VStack alignItems={"start"} gap={"10px"}>
                                {order.items.map((item) => {
                                  total =
                                    total +
                                    item.quantity * item.discountedPrice;
                                  return (
                                    <HStack
                                      flexWrap={"wrap"}
                                      w={"100%"}
                                      justifyContent={"space-between"}
                                    >
                                      <HStack
                                        gap={"4px"}
                                        w={"50%"}
                                        flexWrap={"wrap"}
                                      >
                                        <Image
                                          src={item.image}
                                          boxSize={"50px"}
                                          borderRadius={"lg"}
                                        />
                                        <Box>
                                          <Text
                                            fontSize={"md"}
                                            fontWeight={"medium"}
                                          >
                                            {item.productName}
                                          </Text>
                                        </Box>
                                      </HStack>
                                      <Text fontSize={"md"}>
                                        {item.quantity} x {item.discountedPrice}
                                      </Text>
                                    </HStack>
                                  );
                                })}

                                <HStack
                                  flexWrap={"wrap"}
                                  w={"100%"}
                                  justifyContent={"end"}
                                >
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    Total: {total}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Box>
                          </AccordionPanel>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack w={"100%"}>
                  <Accordion allowToggle w={"100%"}>
                    {result.inTransit.map((order) => {
                      let total = 0;
                      return (
                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box
                                as="span"
                                flex="1"
                                textAlign="left"
                                fontWeight={"700"}
                              >
                                Order {order.id}
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <Box>
                              <Box mb={"16px"}>
                                <Text fontWeight={"500"}>{order.vendor}</Text>
                                <Text></Text>
                              </Box>
                              <VStack alignItems={"start"} gap={"10px"}>
                                {order.items.map((item) => {
                                  total =
                                    total +
                                    item.quantity * item.discountedPrice;
                                  return (
                                    <HStack
                                      flexWrap={"wrap"}
                                      w={"100%"}
                                      justifyContent={"space-between"}
                                    >
                                      <HStack
                                        gap={"4px"}
                                        w={"50%"}
                                        flexWrap={"wrap"}
                                      >
                                        <Image
                                          src={item.image}
                                          boxSize={"50px"}
                                          borderRadius={"lg"}
                                        />
                                        <Box>
                                          <Text
                                            fontSize={"md"}
                                            fontWeight={"medium"}
                                          >
                                            {item.productName}
                                          </Text>
                                        </Box>
                                      </HStack>
                                      <Text fontSize={"md"}>
                                        {item.quantity} x {item.discountedPrice}
                                      </Text>
                                    </HStack>
                                  );
                                })}

                                <HStack
                                  flexWrap={"wrap"}
                                  w={"100%"}
                                  justifyContent={"end"}
                                >
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    Total: {total}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Box>
                          </AccordionPanel>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack w={"100%"}>
                  <Accordion allowToggle w={"100%"}>
                    {result.completed.map((order) => {
                      let total = 0;
                      return (
                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box
                                as="span"
                                flex="1"
                                textAlign="left"
                                fontWeight={"700"}
                              >
                                Order {order.id}
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <Box>
                              <Box mb={"16px"}>
                                <Text fontWeight={"500"}>{order.vendor}</Text>
                                <Text></Text>
                              </Box>
                              <VStack alignItems={"start"} gap={"10px"}>
                                {order.items.map((item) => {
                                  total =
                                    total +
                                    item.quantity * item.discountedPrice;
                                  return (
                                    <HStack
                                      flexWrap={"wrap"}
                                      w={"100%"}
                                      justifyContent={"space-between"}
                                    >
                                      <HStack
                                        gap={"4px"}
                                        w={"50%"}
                                        flexWrap={"wrap"}
                                      >
                                        <Image
                                          src={item.image}
                                          boxSize={"50px"}
                                          borderRadius={"lg"}
                                        />
                                        <Box>
                                          <Text
                                            fontSize={"md"}
                                            fontWeight={"medium"}
                                          >
                                            {item.productName}
                                          </Text>
                                        </Box>
                                      </HStack>
                                      <Text fontSize={"md"}>
                                        {item.quantity} x {item.discountedPrice}
                                      </Text>
                                    </HStack>
                                  );
                                })}

                                <HStack
                                  flexWrap={"wrap"}
                                  w={"100%"}
                                  justifyContent={"end"}
                                >
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    Total: {total}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Box>
                          </AccordionPanel>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Layout>
  );
};

export default Orders;

export async function getServerSideProps(context) {
  const userSession = await getSession(context);

  if (!userSession) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: { providers: [] },
    };
  }

  const response = await firestore
    .collection("users")
    .where("email", "==", userSession.user.email)
    .limit(1)
    .get();

  userSession.user.docId = response.docs[0].id;

  const orderResponse = await firestore
    .collection("orders")
    .where("customerId", "==", userSession.user.docId)
    .get();

  const orders = !orderResponse.empty
    ? orderResponse.docs.map((order) => {
        const orderDoc = order.data();
        orderDoc.id = order.id;

        return orderDoc;
      })
    : [];

  const result = {
    orderPlaced: [],
    inTransit: [],
    completed: [],
  };
  const groupedOrders = orders.map((order) => {
    const status = order.status;

    if (status) {
      console.log(status);
      if (status == "order-placed") {
        result.orderPlaced.push(order);
      } else if (status == "in-transit") {
        result.inTransit.push(order);
      } else if (status == "completed") {
        result.orderPlaced.push(order);
      }
    }
  });

  console.log(result);

  return {
    props: { userSession, result },
  };
}
