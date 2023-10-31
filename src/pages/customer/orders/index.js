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
} from "@chakra-ui/react";
import { BsBagFill, BsBagCheckFill } from "react-icons/bs";
import { BiSolidTruck } from "react-icons/bi";
import getOrders from "@/hooks/customer/getOrders";
import { withSessionSsr } from "@/lib/withSession";
import RateProductModal from "@/components/RateProductModal";

const Orders = ({ user, result }) => {
  const { RateModal, openRatingModal, setSelectedProduct } = RateProductModal();

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
                  <BiSolidTruck fontSize={"25px"} />
                  <Text>In Transit</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack minH={"30px"}>
                  <BsBagCheckFill fontSize={"25px"} />
                  <Text>Order Received</Text>
                </HStack>
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
                                Order {order.id.slice(0, 4)}
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
                                          boxSize={"65px"}
                                          borderRadius={"lg"}
                                        />
                                        <VStack alignItems={"start"}>
                                          <Text
                                            fontSize={"md"}
                                            fontWeight={"medium"}
                                          >
                                            {item.productName}
                                          </Text>
                                          <Button
                                            size={"sm"}
                                            variant={"link"}
                                            _hover={{
                                              background: "transparent",
                                              textDecor: "underline",
                                            }}
                                            onClick={() => {
                                              openRatingModal(item);
                                            }}
                                          >
                                            Rate Product
                                          </Button>
                                        </VStack>
                                      </HStack>
                                      <Text fontSize={"md"}>
                                        {item.quantity} x {item.discountedPrice}
                                      </Text>
                                    </HStack>
                                  );
                                })}

                                <VStack
                                  mt={"12px"}
                                  flexWrap={"wrap"}
                                  w={"100%"}
                                  justifyContent={"end"}
                                  alignItems={"end"}
                                >
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    SubTotal: {total}
                                  </Text>
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    Shipping fee: {total}
                                  </Text>
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    Total: {total}
                                  </Text>
                                </VStack>
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
                                Order {order.id.slice(0, 4)}
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

                                <VStack
                                  mt={"12px"}
                                  flexWrap={"wrap"}
                                  w={"100%"}
                                  justifyContent={"end"}
                                  alignItems={"end"}
                                >
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    SubTotal: {total}
                                  </Text>
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    Shipping fee: {total}
                                  </Text>
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    Total: {total}
                                  </Text>
                                </VStack>
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
                                Order {order.id.slice(0, 4)}
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

                                <VStack
                                  mt={"12px"}
                                  flexWrap={"wrap"}
                                  w={"100%"}
                                  justifyContent={"end"}
                                  alignItems={"end"}
                                >
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    SubTotal: {total}
                                  </Text>
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    Shipping fee: {total}
                                  </Text>
                                  <Text fontSize={"md"} fontWeight={"600"}>
                                    Total: {total}
                                  </Text>
                                </VStack>
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
      <RateModal />
    </Layout>
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

  const result = await getOrders(user.docId);

  return {
    props: { user, result },
  };
});
