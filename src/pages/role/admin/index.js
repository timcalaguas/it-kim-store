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
  HStack,
  VStack,
  Avatar,
  Tag,
  TagLabel,
  Button,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { AiFillShop } from "react-icons/ai";
import { MdDeliveryDining } from "react-icons/md";
import { withSessionSsr } from "@/lib/withSession";
import getAdminDashboardCount from "@/hooks/admin/getAdminDashboardCounts";
import Link from "next/link";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/admin" },
  { name: "Vendors", icon: FiTrendingUp, link: "/role/admin/vendors" },
  { name: "Couriers", icon: FiCompass, link: "/role/admin/couriers" },
];

const Dashboard = ({ user, vendorCount, courierCount }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <AdminLayout
        metaTitle={"Admin - Dashboard"}
        pageName={"IT Kim - Admin"}
        user={user}
        LinkItems={LinkItems}
      >
        <Card mb={"24px"}>
          <CardBody position={"relative"} overflow={"hidden"}>
            <HStack gap={"24px"} flexWrap={"wrap"}>
              <VStack marginInline={{ base: "auto", md: "0" }}>
                <Avatar src={user.picture} name={user.name} boxSize={"200px"} />
              </VStack>
              <Box>
                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Name:</Text>
                  <Text>{user.name}</Text>
                </Box>

                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Email:</Text>
                  <Text>{user.email}</Text>
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
                  <Heading size={"4xl"}>{vendorCount}</Heading>
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
                  <Heading size={"4xl"}>{courierCount}</Heading>
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

  if (user.role != "admin") {
    return {
      notFound: true,
    };
  }

  const { vendorCount, courierCount } = await getAdminDashboardCount();

  return {
    props: { user, vendorCount, courierCount },
  };
});
