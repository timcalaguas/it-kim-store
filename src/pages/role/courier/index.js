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
} from "@chakra-ui/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/courier" },
  { name: "Orders", icon: FiTrendingUp, link: "/role/courier/orders" },
];

const Courier = ({ userSession }) => {
  return (
    <AdminLayout
      metaTitle={"IT Kim - Courier"}
      pageName="Courier"
      user={userSession}
      LinkItems={LinkItems}
    >
      <Box>
        <Box
          border={"1px"}
          borderColor={"gray.200"}
          padding={"16px"}
          borderRadius={"xl"}
          bg={"white"}
          minH={"200px"}
        >
          <Text fontWeight={"600"}>Current Delivery</Text>
        </Box>
        <Flex
          gap={4}
          justifyContent={"space-between"}
          flexWrap={"wrap"}
          mt={"24px"}
        >
          <Card
            minW={"320px"}
            w={{ base: "100%", md: "48%" }}
            minHeight={"250px"}
          >
            <CardHeader>
              <Heading>AVAILABLE ORDERS</Heading>
            </CardHeader>
            <CardBody position={"relative"} overflow={"hidden"}>
              <Heading size={"4xl"}>5</Heading>
              <Image
                position={"absolute"}
                bottom={"10px"}
                right={"10px"}
                src="./vendor.svg"
                boxSize={"120px"}
              ></Image>
            </CardBody>
          </Card>
          <Card
            minW={"320px"}
            w={{ base: "100%", md: "48%" }}
            minHeight={"250px"}
          >
            <CardHeader>
              <Heading>FINISHED ORDERS</Heading>
            </CardHeader>
            <CardBody position={"relative"} overflow={"hidden"}>
              <Heading size={"4xl"}>5</Heading>
              <Image
                position={"absolute"}
                bottom={"-15px"}
                right={"-15px"}
                src="./buyer.svg"
                boxSize={"180px"}
              ></Image>
            </CardBody>
          </Card>
        </Flex>
      </Box>
    </AdminLayout>
  );
};

export default Courier;

export async function getServerSideProps(context) {
  const userSession = await getSession(context);

  if (!userSession) {
    return {
      redirect: {
        permanent: false,
        destination: "/role/vendor/auth/login",
      },
      props: { providers: [] },
    };
  }

  const response = await firestore
    .collection("users")
    .where("email", "==", userSession.user.email)
    .limit(1)
    .get();

  const userDoc = !response.empty ? response.docs[0].data() : {};
  userSession.user.addresses = userDoc.addresses ? userDoc.addresses : [];
  userSession.user.docId = response.docs[0].id;
  userSession.user.storeName = userDoc.storeName ? userDoc.storeName : "";
  userSession.user.storeLogo = userDoc.storeLogo ? userDoc.storeLogo : "";
  userSession.user.status = userDoc.status ? userDoc.status : "";
  return {
    props: { userSession },
  };
}
