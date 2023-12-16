import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../../firebase-config";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import {
  AiFillShop,
  AiFillDelete,
  AiFillEye,
  AiFillCheckCircle,
} from "react-icons/ai";
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
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  AlertDialogOverlay,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { MdDeliveryDining, MdPerson } from "react-icons/md";

import moment from "moment/moment";
import { withSessionSsr } from "@/lib/withSession";
import getUsers from "@/hooks/getUsers";

import { BiSolidShoppingBag } from "react-icons/bi";
import { FaPesoSign } from "react-icons/fa6";
import { FaStar } from "react-icons/fa";
import getWorkerDetails from "@/hooks/admin/getVendorDetails";
import { AiTwotoneMail, AiTwotoneHome, AiTwotonePhone } from "react-icons/ai";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/admin" },
  { name: "Vendors", icon: AiFillShop, link: "/role/admin/vendors" },
  { name: "Couriers", icon: MdDeliveryDining, link: "/role/admin/couriers" },
  { name: "Customers", icon: MdPerson, link: "/role/admin/customers" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/admin/sales-report" },
];

const Vendors = ({ vendorDocs, user }) => {
  const toast = useToast();

  const [vendor, setVendor] = useState(vendorDocs);
  const [selectedId, setSelectedId] = useState("");
  const [process, setProcess] = useState("accept");
  const [selectedItem, setSelectedItem] = useState([]);
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

  const openModal = (vendor) => {
    setSelectedItem(vendor);
    itemOnOpen();
  };

  const processVendor = async () => {
    setProcessLoading(true);

    let status =
      process == "accept"
        ? "approved"
        : process == "decline"
        ? "declined"
        : "blocked";

    const processResponse = await firestore
      .collection("users")
      .doc(selectedItem.id)
      .update({ status: status, adminBy: user.name });
    selectedItem.status = status;
    setProcessLoading(false);

    toast({
      title:
        process == "accept"
          ? "Approved"
          : process == "decline"
          ? "Declined"
          : "Blocked",
      description:
        process == "accept"
          ? "The vendor is now approved."
          : process == "decline"
          ? "The vendor is now declined."
          : "The vendor is now blocked.",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
    onClose();
  };

  return (
    <>
      <AdminLayout
        metaTitle={"Admin - Vendors"}
        pageName={"IT Kim - Admin"}
        user={user}
        LinkItems={LinkItems}
      >
        <Card mb={"24px"}>
          <CardBody>
            <HStack
              flexWrap={"wrap"}
              alignItems={"start"}
              justifyContent={"space-between"}
            >
              <HStack gap={"24px"} flexWrap={"wrap"}>
                <VStack>
                  <Avatar src={vendor.storeLogo} boxSize={"150px"} />
                </VStack>
                <Box>
                  <Text fontSize={"24px"} fontWeight={"600"}>
                    {vendor.storeName != "" ? vendor.storeName : vendor.name}
                  </Text>
                  <HStack>
                    <AiTwotoneMail />
                    <Text>{vendor.email}</Text>
                  </HStack>
                  <HStack>
                    <AiTwotoneHome />
                    <Text>
                      {vendor.addresses?.length > 0
                        ? `${vendor.addresses[0].address.no} ${vendor.addresses[0].address.street} ${vendor.addresses[0].address.barangay} ${vendor.addresses[0].address.city}`
                        : ""}
                    </Text>
                  </HStack>
                  {vendor.addresses?.length > 0 && (
                    <HStack>
                      <AiTwotonePhone />
                      <Text>{vendor.addresses[0].contactNumber}</Text>
                    </HStack>
                  )}
                  <HStack>
                    <Tag
                      size="md"
                      colorScheme={
                        vendor.status === "approved"
                          ? "green"
                          : vendor.status === "pending"
                          ? "orange"
                          : "red"
                      }
                      borderRadius="full"
                      marginBlock={"12px"}
                      textTransform={"uppercase"}
                    >
                      {vendor.status}{" "}
                      {vendor.adminBy ? `by ${vendor.adminBy}` : ""}
                    </Tag>
                  </HStack>

                  <Button mt={"24px"} onClick={() => openModal(vendor)}>
                    View Requirement
                  </Button>
                </Box>
              </HStack>
              <HStack>
                {vendor.status != "approved" && (
                  <Button
                    colorScheme="blue"
                    onClick={() => openProcessDialog(vendor, "accept")}
                  >
                    Approve
                  </Button>
                )}
                {vendor.status == "pending" && (
                  <Button
                    colorScheme="red"
                    onClick={() => openProcessDialog(vendor, "decline")}
                  >
                    Decline
                  </Button>
                )}
                {vendor.status != "blocked" && vendor.status != "pending" && (
                  <Button
                    colorScheme="red"
                    onClick={() => openProcessDialog(vendor, "block")}
                  >
                    Block
                  </Button>
                )}
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>Ratings</Heading>
        </HStack>

        <TableContainer
          background={"white"}
          p={{ base: 2, md: 5 }}
          borderRadius={6}
        >
          {vendor.ratings.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Order ID</Th>
                  <Th>Name</Th>
                  <Th>Rating</Th>
                  <Th>Comment</Th>
                </Tr>
              </Thead>
              <Tbody>
                {vendor.ratings.map((rating) => (
                  <Tr>
                    <Td>{rating.orderId}</Td>
                    <Td>{rating.commentor}</Td>
                    <Td>
                      <HStack>
                        <Text>{rating.starRating} </Text>
                        <FaStar color="gold" />
                      </HStack>
                    </Td>
                    <Td>{rating.comment}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Box
              minH={"200px"}
              display={"grid"}
              placeItems={"center"}
              textAlign={"center"}
            >
              <Heading>No ratings yet</Heading>
            </Box>
          )}
        </TableContainer>
      </AdminLayout>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {process == "accept" ? "Approve Vendor" : "Block Vendor"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {process == "accept"
                ? "Are you sure you want to approve this vendor? This will allow the vendor to publish their products."
                : "Are you sure you want to block this vendor? They will no longer be allowed to use their store and sell products."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={process == "accept" ? "blue" : "red"}
                onClick={() => processVendor()}
                ml={3}
                isLoading={processLoading}
              >
                {process == "accept" ? "Approve" : "Block"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={itemIsOpen} onClose={itemOnClose} size={"xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Requirement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb={"24px"}>
              <Text fontSize={"18px"} fontWeight="600" mb={"12px"}>
                Businesss Permit
              </Text>
              <Image
                src={
                  selectedItem.requirement
                    ? selectedItem.requirement
                    : "https://placehold.co/700x400"
                }
              />
            </Box>
            <Box mb={"24px"}>
              <Text fontSize={"18px"} fontWeight="600" mb={"12px"}>
                Resume
              </Text>
              <embed
                src={selectedItem.resume}
                type="application/pdf"
                width="100%"
                height="500px"
                controls="false"
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Vendors;

export const getServerSideProps = withSessionSsr(async (context) => {
  const { req } = context;
  const { id } = context.params;
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

  const vendorDocs = await getWorkerDetails(id);

  return {
    props: { vendorDocs, user },
  };
});
