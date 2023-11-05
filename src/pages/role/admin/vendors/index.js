import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../firebase-config";
import { getSession } from "next-auth/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import {
  AiTwotoneEdit,
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
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import moment from "moment/moment";
import { withSessionSsr } from "@/lib/withSession";
import getUsers from "@/hooks/getUsers";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/admin" },
  { name: "Vendors", icon: FiTrendingUp, link: "/role/admin/vendors" },
  { name: "Couriers", icon: FiCompass, link: "/role/admin/couriers" },
];

const Vendors = ({ vendorDocs, user }) => {
  const toast = useToast();

  const [vendors, setVendors] = useState(vendorDocs);
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
    const indexOfObjectToUpdate = vendors.findIndex(
      (obj) => obj.id === selectedItem.id
    );
    let status = process == "accept" ? "approved" : "blocked";
    const processResponse = await firestore
      .collection("users")
      .doc(selectedItem.id)
      .update({ status: status });
    selectedItem.status = status;
    setProcessLoading(false);
    vendors[indexOfObjectToUpdate] = selectedItem;

    toast({
      title: process == "accept" ? "Approved" : "Blocked",
      description:
        process == "accept"
          ? "The vendor is now approved."
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
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>List of Vendors</Heading>
        </HStack>

        <TableContainer
          background={"white"}
          p={{ base: 2, md: 5 }}
          borderRadius={6}
        >
          {vendors.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {vendors.map((vendor) => (
                  <Tr>
                    <Td>
                      <HStack>
                        <Avatar boxSize={"32px"} src={vendor.picture} />
                        <Text>{vendor.name}</Text>
                      </HStack>
                    </Td>
                    <Td>{vendor.email}</Td>
                    <Td textTransform={"uppercase"}>
                      <Badge>{vendor.status}</Badge>
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={2}>
                        <Button
                          size={"sm"}
                          colorScheme="orange"
                          variant={"outline"}
                          leftIcon={<AiFillEye />}
                          onClick={() => openModal(vendor)}
                        >
                          View Details
                        </Button>
                        {vendor.status != "approved" && (
                          <>
                            <Button
                              leftIcon={<AiFillCheckCircle />}
                              colorScheme="blue"
                              variant="outline"
                              size={"sm"}
                              onClick={() =>
                                openProcessDialog(vendor, "accept")
                              }
                            >
                              Approve
                            </Button>
                          </>
                        )}
                        {vendor.status != "blocked" && (
                          <Button
                            leftIcon={<AiFillDelete />}
                            colorScheme="red"
                            size={"sm"}
                            variant="outline"
                            onClick={() => openProcessDialog(vendor, "decline")}
                          >
                            Block
                          </Button>
                        )}
                      </Stack>
                    </Td>
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
              <Heading>No vendors yet</Heading>
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
                : "Are you sure you want to block this vendor? They will no longer be allowed to use the their store."}
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

      <Modal isOpen={itemIsOpen} onClose={itemOnClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Store Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack textAlign={"center"}>
              <Avatar
                src={selectedItem.storeLogo}
                boxSize={"100px"}
                border={"1px"}
              />
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Store Name:</Text>{" "}
                {selectedItem.storeName}
              </Text>
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Store Address:</Text>{" "}
                {selectedItem.addresses?.length > 0 &&
                  `${selectedItem.addresses[0].address.no} ${selectedItem.addresses[0].address.street} ${selectedItem.addresses[0].address.barangay} ${selectedItem.addresses[0].address.city}`}
              </Text>
              <Text mb={"12px"}>
                <Text fontWeight={"500"}>Contact Number:</Text>{" "}
                {selectedItem.addresses?.length > 0 &&
                  selectedItem.addresses[0].contactNumber}{" "}
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Vendors;

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

  const vendorDocs = await getUsers("vendor");

  return {
    props: { vendorDocs, user },
  };
});
