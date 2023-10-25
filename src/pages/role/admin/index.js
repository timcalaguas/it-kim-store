import AdminLayout from "@/components/AdminLayout";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import {
  Heading,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Image,
  Stack,
  Box,
  Link,
  HStack,
  VStack,
  Avatar,
  Tag,
  TagLabel,
  Button,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { AiFillShop } from "react-icons/ai";
import { MdDeliveryDining } from "react-icons/md";
import { firestore } from "../../../../firebase-config";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/admin" },
  { name: "Vendors", icon: FiTrendingUp, link: "/role/admin/vendors" },
  { name: "Couriers", icon: FiCompass, link: "/role/admin/couriers" },
];

const Dashboard = ({ userSession }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <AdminLayout
        metaTitle={"Admin - Dashboard"}
        pageName={"IT Kim - Admin"}
        user={userSession}
        LinkItems={LinkItems}
      >
        <Card mb={"24px"}>
          <CardBody position={"relative"} overflow={"hidden"}>
            <HStack gap={"24px"} flexWrap={"wrap"}>
              <VStack marginInline={{ base: "auto", md: "0" }}>
                <Avatar
                  src={userSession.user.picture}
                  name={userSession.user.name}
                  boxSize={"200px"}
                />
              </VStack>
              <Box>
                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Name:</Text>
                  <Text>{userSession.user.name}</Text>
                </Box>

                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Email:</Text>
                  <Text>{userSession.user.email}</Text>
                </Box>
              </Box>
            </HStack>
          </CardBody>
        </Card>
        <Flex gap={4} justifyContent={"space-between"} flexWrap={"wrap"}>
          <Card
            minW={{ base: "100%", xl: "320px" }}
            w={{ base: "100%", xl: "48%" }}
            minHeight={"250px"}
            position={"relative"}
            overflow={"hidden"}
            as={Link}
            href="/role/admin/vendors"
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
                  <AiFillShop fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>VENDORS</Heading>
                  <Heading size={"4xl"}>5</Heading>
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
            href="/role/admin/couriers"
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
                  <MdDeliveryDining fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>COURIERS</Heading>
                  <Heading size={"4xl"}>5</Heading>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </Flex>
      </AdminLayout>
    </>
  );
};

export default Dashboard;

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
