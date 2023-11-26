import AdminLayout from "@/components/AdminLayout";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import {
  Box,
  Text,
  Heading,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Image,
  Avatar,
  HStack,
  Alert,
  Button,
  useDisclosure,
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
  FormControl,
  Input,
  FormLabel,
  Divider,
  FormErrorMessage,
  useToast,
  VStack,
  Tag,
  TagLabel,
  AlertIcon,
  Stack,
} from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { firestore, storage } from "../../../../firebase-config";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AiFillShopping } from "react-icons/ai";
import { BsFillCartCheckFill } from "react-icons/bs";
import { FaPesoSign } from "react-icons/fa6";

import { withSessionSsr } from "@/lib/withSession";
import geVendorDashboardCount from "@/hooks/vendors/getVendorDashboardCount";
import Link from "next/link";
import axios from "axios";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/vendor" },
  { name: "Products", icon: AiFillShopping, link: "/role/vendor/products" },
  { name: "Orders", icon: BsFillCartCheckFill, link: "/role/vendor/orders" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/vendor/sales-report" },
];

const Dashboard = ({ userSession, productCount, orderCount, salesReport }) => {
  const storageRef = storage.ref();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const [user, setUser] = useState(userSession);

  const [storeLogo, setStoreLogo] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const selectedFile = watch("storeLogo");

  useEffect(() => {
    if (selectedFile?.length > 0) {
      setPreviewImage(selectedFile[0]);
    }
  }, [selectedFile]);

  useEffect(() => {
    setValue("storeName", user.storeName);
    if (user.addresses?.length > 0) {
      setValue("no", user.addresses[0].address.no);
      setValue("street", user.addresses[0].address.street);
      setValue("barangay", user.addresses[0].address.barangay);
      setValue("city", user.addresses[0].address.city);
      setValue("contactNumber", user.addresses[0].contactNumber);
    }
    setValue("storeName", user.storeName);
    setStoreLogo(user.storeLogo);
  }, [user]);

  async function updateProfile(values) {
    try {
      const addresses = [
        {
          address: {
            no: values.no,
            street: values.street,
            barangay: values.barangay,
            city: values.city,
          },
          contactNumber: values.contactNumber,
        },
      ];

      let downloadURL;

      if (values.storeLogo.length > 0) {
        const productImageName = values.storeLogo[0]?.name;

        const imageRef = storageRef.child(`images/${productImageName}`);
        const file = values.storeLogo[0];

        const snapshot = await imageRef.put(file);

        downloadURL = await imageRef.getDownloadURL();
      } else {
        downloadURL = user.storeLogo;
      }

      const newUser = {
        addresses: addresses,
        storeName: values.storeName,
        storeLogo: downloadURL,
        name: user.name,
        role: user.role,
        email: user.email,
        picture: user.picture,
        status: user.status,
      };

      const response = await firestore
        .collection("users")
        .doc(user.docId)
        .set({
          ...newUser,
        });

      const updateSession = await axios.post("/api/auth", {
        user: user,
        role: user.role,
      });

      if (!isSubmitting && updateSession.status == 200) {
        toast({
          title: "User Profile updated.",
          description: "Your user profile is successfully updated.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setUser(newUser);
        onClose();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <>
      <AdminLayout
        metaTitle={"Vendor - Dashboard"}
        pageName={"IT Kim - Vendor"}
        user={user}
        LinkItems={LinkItems}
      >
        {(user.storeName == "" || user.addresses?.length == 0) && (
          <Alert status="warning" mb={"20px"}>
            <AlertIcon />
            <HStack
              marginLeft={"12px"}
              justifyContent={"space-between"}
              w={"100%"}
              flexWrap={"wrap"}
            >
              <Text>Please provide your store details</Text>
              <Button variant={"primary"} size={"sm"} onClick={onOpen}>
                Update Profile
              </Button>
            </HStack>
          </Alert>
        )}
        <Card mb={"24px"}>
          <CardBody position={"relative"} overflow={"hidden"}>
            <HStack gap={"24px"} flexWrap={"wrap"}>
              <VStack marginInline={{ base: "auto", md: "0" }}>
                <Avatar
                  src={user.storeLogo}
                  name={user.storeName}
                  boxSize={"200px"}
                />
                <Tag
                  size="lg"
                  colorScheme={user.status === "approved" ? "green" : "orange"}
                  borderRadius="full"
                  marginBlock={"12px"}
                >
                  {user.status === "approved" ? (
                    <TagLabel textTransform={"uppercase"}>
                      {user.status}
                    </TagLabel>
                  ) : (
                    <TagLabel textTransform={"uppercase"}>Pending</TagLabel>
                  )}
                </Tag>
                <Button colorScheme="blue" onClick={onOpen}>
                  Update Profile
                </Button>
              </VStack>
              <Box>
                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Store Name:</Text>
                  <Text>{user.storeName}</Text>
                </Box>
                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Store Address:</Text>
                  <Text>
                    {user.addresses?.length > 0
                      ? `${user.addresses[0].address.no} ${user.addresses[0].address.street} ${user.addresses[0].address.barangay} ${user.addresses[0].address.city}`
                      : ""}
                  </Text>
                </Box>
                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Store Contact No.:</Text>
                  <Text>
                    {user.addresses?.length > 0
                      ? user.addresses[0].contactNumber
                      : ""}
                  </Text>
                </Box>
                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Vendor Name:</Text>
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
            href={"/role/vendor/products"}
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
                  w={{ base: "100%", md: "auto" }}
                  height={"100%"}
                  minW={{ base: "150px", md: "200px" }}
                  display={"grid"}
                  placeItems={"center"}
                >
                  <AiFillShopping fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>PRODUCTS</Heading>
                  <Heading size={"4xl"}>{productCount}</Heading>
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
            href={"/role/vendor/orders"}
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
                  <BsFillCartCheckFill fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>ORDERS</Heading>
                  <Heading size={"4xl"}>{orderCount}</Heading>
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
            href={"/role/vendor/sales-report"}
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
                  <FaPesoSign fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>SALES REPORT</Heading>
                  <Heading size={"4xl"}>{salesReport}</Heading>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </Flex>
        <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
          <form onSubmit={handleSubmit(updateProfile)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Update Profile</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
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
                      src={
                        selectedFile?.length > 0
                          ? URL.createObjectURL(selectedFile[0])
                          : "https://placehold.co/400x400"
                      }
                      boxSize={{ base: "100%", sm: "200px" }}
                    />
                  ) : storeLogo != "" ? (
                    <Image
                      id="preview"
                      src={storeLogo}
                      boxSize={{ base: "100%", sm: "200px" }}
                    />
                  ) : (
                    <Image
                      id="preview"
                      src={"https://placehold.co/400x400"}
                      boxSize={{ base: "100%", sm: "200px" }}
                    />
                  )}

                  <FormControl
                    isInvalid={errors.storeLogo}
                    w={{ base: "100%", sm: "fit-content" }}
                  >
                    <FormLabel htmlFor="name">Image</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      {...register("storeLogo", {
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
                      {errors.storeLogo && errors.storeLogo.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
                <FormControl>
                  <FormLabel>Store Name</FormLabel>
                  <Input type="text" {...register("storeName")} />
                </FormControl>

                <Divider marginBlock={"12px"} />
                <Text fontWeight={"bold"} fontSize={"xl"} marginBottom={"12px"}>
                  Address
                </Text>
                <FormControl>
                  <FormLabel>Contact Number</FormLabel>
                  <Input type="text" {...register("contactNumber")} />
                </FormControl>
                <FormControl>
                  <FormLabel>House No. / Blk No. / Lot No.</FormLabel>
                  <Input type="text" {...register("no")} />
                </FormControl>
                <FormControl>
                  <FormLabel>Street</FormLabel>
                  <Input type="text" {...register("street")} />
                </FormControl>
                <FormControl>
                  <FormLabel>Barangay</FormLabel>
                  <Input type="text" {...register("barangay")} />
                </FormControl>
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input type="text" {...register("city")} />
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  Update
                </Button>
              </ModalFooter>
            </ModalContent>
          </form>
        </Modal>
      </AdminLayout>
    </>
  );
};

export default Dashboard;

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const userSession = req.session.user ? req.session.user : null;

  if (!userSession) {
    return {
      redirect: {
        permanent: false,
        destination: "/role/vendor/auth/login",
      },
    };
  }

  if (userSession.role != "vendor") {
    return {
      notFound: true,
    };
  }

  const { productCount, orderCount, salesReport } =
    await geVendorDashboardCount(userSession.docId);

  return {
    props: { userSession, productCount, orderCount, salesReport },
  };
});
