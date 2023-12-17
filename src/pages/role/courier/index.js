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
  Stack,
  HStack,
  Tag,
  VStack,
  Avatar,
  Button,
  TagLabel,
  useDisclosure,
  Alert,
  AlertIcon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalOverlay,
  FormControl,
  FormLabel,
  Input,
  Divider,
  ModalFooter,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormErrorMessage,
} from "@chakra-ui/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import { withSessionSsr } from "@/lib/withSession";
import Link from "next/link";
import {
  BsCartCheckFill,
  BsFillCartCheckFill,
  BsFillCartFill,
} from "react-icons/bs";
import getCourierDashboardCount from "@/hooks/courier/getCourierDashboardCount";
import getCurrentOrder from "@/hooks/courier/getCurrentOrder";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { firestore, storage } from "../../../../firebase-config";
import axios from "axios";
import moment from "moment";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/courier" },
  {
    name: "Available Orders",
    icon: FiCompass,
    link: "/role/courier/orders/available",
  },
  { name: "Finished Orders", icon: FiStar, link: "/role/courier/orders/done" },
];

const Courier = ({
  userSession,
  availableOrderCount,
  finishedOrderCount,
  order,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: dialogIsOpen,
    onOpen: dialogOnOpen,
    onClose: dialogClose,
  } = useDisclosure();
  const storageRef = storage.ref();

  const { register, handleSubmit, watch, setValue, errors, isSubmitting } =
    useForm();

  const [user, setUser] = useState(userSession);
  const toast = useToast();
  const [doneCount, setDoneCount] = useState(finishedOrderCount);

  const [storeLogo, setStoreLogo] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const [requirementImage, setRequirementImage] = useState("");
  const [requirementPreviewImage, setRequirementPreviewImage] = useState("");

  const [resume, setResume] = useState("");

  const selectedFile = watch("storeLogo");
  const requirementSelectedFile = watch("requirement");
  const resumeSelectedFile = watch("resume");

  useEffect(() => {
    if (selectedFile?.length > 0) {
      setPreviewImage(selectedFile[0]);
    }

    if (requirementSelectedFile?.length > 0) {
      setRequirementPreviewImage(requirementSelectedFile[0]);
    }

    if (resumeSelectedFile?.length > 0) {
      setRequirementPreviewImage(resumeSelectedFile[0]);
    }
  }, [selectedFile, requirementSelectedFile, resumeSelectedFile]);

  useEffect(() => {
    setValue("storeLogo", "");
    if (user.addresses?.length > 0) {
      setValue("no", user.addresses[0].address.no);
      setValue("street", user.addresses[0].address.street);
      setValue("barangay", user.addresses[0].address.barangay);
      setValue("city", user.addresses[0].address.city);
      setValue("contactNumber", user.addresses[0].contactNumber);
      setValue("province", user.addresses[0].address.province);
    }
    setValue("storeName", user.storeName);
    setStoreLogo(user.picture);
    setRequirementImage(user.requirement);
    setResume(user.resume);
  }, [user]);

  console.log(user);

  async function updateProfile(values) {
    try {
      const addresses = [
        {
          address: {
            no: values.no,
            street: values.street,
            barangay: values.barangay,
            city: values.city,
            province: values.province,
          },
          contactNumber: values.contactNumber,
        },
      ];

      let downloadURL;
      let requirementDownloadURL;
      let resumeDownloadURL;

      if (values.storeLogo.length > 0) {
        const productImageName = values.storeLogo[0]?.name;

        const imageRef = storageRef.child(`images/${productImageName}`);
        const file = values.storeLogo[0];

        const snapshot = await imageRef.put(file);

        downloadURL = await imageRef.getDownloadURL();
      } else {
        downloadURL = user.picture;
      }

      if (values.requirement.length > 0) {
        const productImageName = values.requirement[0]?.name;

        const imageRef = storageRef.child(`images/${productImageName}`);
        const file = values.requirement[0];

        const snapshot = await imageRef.put(file);

        requirementDownloadURL = await imageRef.getDownloadURL();
      } else {
        requirementDownloadURL = user.requirement || "";
      }

      if (values.resume.length > 0) {
        const productImageName = values.resume[0]?.name;

        const imageRef = storageRef.child(`pdf/${productImageName}`);
        const file = values.resume[0];

        const snapshot = await imageRef.put(file);

        resumeDownloadURL = await imageRef.getDownloadURL();
      } else {
        resumeDownloadURL = user.resume || "";
      }

      user.addresses = addresses;
      user.picture = downloadURL;
      user.requirement = requirementDownloadURL;
      user.resume = resumeDownloadURL;

      const response = await firestore
        .collection("users")
        .doc(user.docId)
        .update({
          addresses: addresses,
          picture: downloadURL,
          requirement: requirementDownloadURL,
          resume: resumeDownloadURL,
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
        setUser(user);
        onClose();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const [type, setType] = useState("");
  const [selectedItem, setSelectedItem] = useState({});
  const cancelRef = useRef();
  const [processLoading, setProcessLoading] = useState(false);

  const openModal = (type, order) => {
    if (type === "update") {
      onOpen();
      setType(type);
    } else {
      onOpen();
      setType(type);
      setSelectedItem(order);
    }
  };

  const openDialog = (order) => {
    dialogOnOpen();
    setSelectedItem(order);
  };

  const processOrder = async () => {
    try {
      setProcessLoading(true);

      const processResponse = await firestore
        .collection("orders")
        .doc(selectedItem.id)
        .update({
          status: "delivered",
          completedDate: moment(new Date()).format("MM-DD-YYYY HH:mm"),
        });

      const docRef = firestore.collection("users").doc(user.docId);

      const responseUser = await docRef.update({
        order: null,
      });

      user.order = null;

      const updateSession = await axios.post("/api/auth", {
        user: user,
        role: user.role,
      });

      setUser(user);

      if (updateSession.status === 200) {
        setProcessLoading(false);
        toast({
          title: "Order is Delivered",
          description: "The order is now delivered. Thank you.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        dialogClose();
        setDoneCount(doneCount + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AdminLayout
      metaTitle={"Courier - Dashboard"}
      pageName="IT- Kim - Courier"
      user={user}
      LinkItems={LinkItems}
    >
      <Box>
        {user.status == "declined" && (
          <Alert status="warning" mb={"20px"}>
            <AlertIcon />
            <HStack
              marginLeft={"12px"}
              justifyContent={"space-between"}
              w={"100%"}
              flexWrap={"wrap"}
            >
              <Text>
                Your application is decline. Please update your details again to
                verify your identity
              </Text>
              <Button
                variant={"primary"}
                size={"sm"}
                onClick={() => openModal("update", {})}
              >
                Update Profile
              </Button>
            </HStack>
          </Alert>
        )}{" "}
        {user.addresses.length == 0 && (
          <Alert status="warning" mb={"20px"}>
            <AlertIcon />
            <HStack
              marginLeft={"12px"}
              justifyContent={"space-between"}
              w={"100%"}
              flexWrap={"wrap"}
            >
              <Text>Please provide your details</Text>
              <Button
                variant={"primary"}
                size={"sm"}
                onClick={() => openModal("update", {})}
              >
                Update Profile
              </Button>
            </HStack>
          </Alert>
        )}{" "}
        <Flex
          gap={4}
          justifyContent={"space-between"}
          flexWrap={"wrap"}
          mt={"24px"}
          alignItems={"stretch"}
        >
          <Card
            minW={{ base: "100%", xl: "100%" }}
            w={{ base: "100%", xl: "100%" }}
          >
            <CardBody position={"relative"} overflow={"hidden"}>
              <HStack gap={"24px"} flexWrap={"wrap"}>
                <VStack marginInline={{ base: "auto", md: "0" }}>
                  <Avatar
                    src={user.picture}
                    
                    boxSize={"200px"}
                  />
                  <Tag
                    size="lg"
                    colorScheme={
                      user.status === "approved" ? "green" : "orange"
                    }
                    borderRadius="full"
                    marginBlock={"12px"}
                  >
                    {user.status === "approved" ? (
                      <TagLabel textTransform={"uppercase"}>
                        {user.status}
                      </TagLabel>
                    ) : (
                      <TagLabel textTransform={"uppercase"}>
                        {user.status}
                      </TagLabel>
                    )}
                  </Tag>
                  <Button
                    colorScheme="blue"
                    onClick={() => openModal("update", {})}
                  >
                    Update Profile
                  </Button>
                </VStack>
                <Box>
                  <Box mb={"12px"}>
                    <Text fontWeight={"bold"}>Name:</Text>
                    <Text>{user.name}</Text>
                  </Box>
                  <Box mb={"12px"}>
                    <Text fontWeight={"bold"}>Address:</Text>
                    <Text>
                      {user.addresses?.length > 0
                        ? `${user.addresses[0].address.no} ${user.addresses[0].address.street} ${user.addresses[0].address.barangay} ${user.addresses[0].address.city} ${user.addresses[0].address.province}`
                        : ""}
                    </Text>
                  </Box>
                  <Box mb={"12px"}>
                    <Text fontWeight={"bold"}>Contact No.:</Text>
                    <Text>
                      {user.addresses?.length > 0
                        ? user.addresses[0].contactNumber
                        : ""}
                    </Text>
                  </Box>

                  <Box mb={"12px"}>
                    <Text fontWeight={"bold"}>Email:</Text>
                    <Text>{user.email}</Text>
                  </Box>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card
            minW={{ base: "100%", xl: "100%" }}
            w={{ base: "100%", xl: "100%" }}
          >
            <CardBody>
              <HStack justifyContent={"space-between"}>
                <Text mb="12px" fontWeight={"700"} fontSize={"32px"}>
                  Current Delivery
                </Text>
                {order != null && (
                  <HStack>
                    <Button
                      colorScheme="orange"
                      size={"sm"}
                      onClick={() => openModal("view-items", order)}
                    >
                      View Items
                    </Button>
                    <Button
                      colorScheme={"blue"}
                      size={"sm"}
                      onClick={() => openDialog(order)}
                    >
                      Delivered?
                    </Button>
                  </HStack>
                )}
              </HStack>
              {order != null ? (
                <Box>
                  <Text fontSize={"24px"} fontWeight={"700"} mb={"12px"}>
                    Order
                  </Text>
                  <HStack flexWrap={"wrap"} alignItems={"start"} gap={"24px"}>
                    <Box w={"50%"}>
                      <Text fontWeight={"600"} fontSize={"18px"} mb={"12px"}>
                        Customer Info
                      </Text>
                      <HStack mb={"12px"}>
                        <Avatar src={order.customer?.picture} />
                        <Box>
                          <Text>{order.customer?.name}</Text>
                          <Text>{order.customer?.email}</Text>
                        </Box>
                      </HStack>
                      <Text mb={"12px"}>
                        <Text fontWeight={"500"}>Address:</Text>{" "}
                        {order.customer?.address &&
                          `${order.customer.address.address.no} ${order.customer.address.address.street} ${order.customer.address.address.barangay} ${order.customer.address.address.city}  ${order.customer.address.address.province}`}
                      </Text>
                      <Text>
                        <Text fontWeight={"500"}>Contact Number:</Text>{" "}
                        {order.customer?.address &&
                          order.customer.address.contactNumber}{" "}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight={"600"} fontSize={"18px"} mb={"12px"}>
                        Vendor Info
                      </Text>
                      <HStack mb={"12px"}>
                        <Avatar src={order.vendorImage} />
                        <Box>
                          <Text>{order.vendor}</Text>
                          <Text>{order.vendorEmail}</Text>
                        </Box>
                      </HStack>
                      <Text mb={"12px"}>
                        <Text fontWeight={"500"}>Address:</Text>{" "}
                        {order.vendorAddress &&
                          `${order.vendorAddress.address.no} ${order.vendorAddress.address.street} ${order.vendorAddress.address.barangay} ${order.vendorAddress.address.city}`}
                      </Text>
                      <Text mb={"12px"}>
                        <Text fontWeight={"500"}>Contact Number:</Text>{" "}
                        {order.vendorAddress &&
                          order.vendorAddress.contactNumber}{" "}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Box display={"grid"} placeItems={"center"} gap={"12px"}>
                  <Box display={"grid"} placeItems={"center"} gap={"12px"}>
                    <Text fontWeight={"700"} fontSize={"3xl"}>
                      No Order accepted yet
                    </Text>
                    <Button
                      as={Link}
                      href="/role/courier/orders/available"
                      colorScheme="blue"
                      _hover={{ textDecor: "none" }}
                    >
                      View Available Orders
                    </Button>
                  </Box>
                </Box>
              )}
            </CardBody>
          </Card>
        </Flex>
        <Flex
          gap={4}
          justifyContent={"space-between"}
          flexWrap={"wrap"}
          mt={"24px"}
        >
          <Card
            minW={{ base: "100%", xl: "320px" }}
            w={{ base: "100%", xl: "48%" }}
            minHeight={"250px"}
            position={"relative"}
            overflow={"hidden"}
            as={Link}
            href="/role/courier/orders/available"
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
                  <BsFillCartFill fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>AVAILABLE ORDERS</Heading>
                  <Heading size={"4xl"}>{availableOrderCount}</Heading>
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
            href="/role/courier/orders/done"
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
                  <BsCartCheckFill fontSize={"100px"} fill="#3082CF" />
                </Box>
                <Box padding={"16px"}>
                  <Heading color={"#3082CF"}>FINISHED ORDERS</Heading>
                  <Heading size={"4xl"}>{doneCount}</Heading>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </Flex>
      </Box>
      <AlertDialog
        isOpen={dialogIsOpen}
        leastDestructiveRef={cancelRef}
        onClose={dialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Order is delivered?
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you already delivered the order and the customer have
              accepted it?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={dialogClose}>
                Cancel
              </Button>
              <Button
                colorScheme={"blue"}
                onClick={() => processOrder()}
                ml={3}
                isLoading={processLoading}
              >
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
        <ModalOverlay />
        <form onSubmit={handleSubmit(updateProfile)}>
          <ModalContent>
            <ModalHeader>
              {type === "update" ? "Update Profile" : "Order Items"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {type === "update" ? (
                <>
                  <Box
                    display={"flex"}
                    flexDirection={"start"}
                    w={"100%"}
                    gap={"24px"}
                    flexWrap={"wrap"}
                    mb="12px"
                  >
                    {previewImage != "" ? (
                      <Avatar
                        id="preview"
                        src={
                          selectedFile?.length > 0
                            ? URL.createObjectURL(selectedFile[0])
                            : "https://placehold.co/400x400"
                        }
                        boxSize={{ base: "100%", sm: "200px" }}
                      />
                    ) : storeLogo != "" ? (
                      <Avatar
                        id="preview"
                        src={storeLogo}
                        boxSize={{ base: "100%", sm: "200px" }}
                      />
                    ) : (
                      <Avatar
                        id="preview"
                        src={"https://placehold.co/400x400"}
                        boxSize={{ base: "100%", sm: "200px" }}
                      />
                    )}

                    <FormControl w={{ base: "100%", sm: "fit-content" }}>
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
                      <FormErrorMessage></FormErrorMessage>
                    </FormControl>
                  </Box>
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
                  <FormControl>
                    <FormLabel>Province</FormLabel>
                    <Input type="text" {...register("province")} />
                  </FormControl>
                  <Box
                    display={"flex"}
                    flexDirection={"start"}
                    w={"100%"}
                    gap={"24px"}
                    flexWrap={"wrap"}
                    mb="12px"
                    mt={"24px"}
                  >
                    {requirementPreviewImage != "" ? (
                      <Image
                        id="preview"
                        src={
                          requirementSelectedFile?.length > 0
                            ? URL.createObjectURL(requirementSelectedFile[0])
                            : "https://placehold.co/700x400"
                        }
                        boxSize={{ base: "100%" }}
                        aspectRatio={"2 / 1"}
                      />
                    ) : requirementImage != "" ? (
                      <Image
                        id="preview"
                        src={requirementImage}
                        boxSize={{ base: "100%" }}
                        aspectRatio={"2 / 1"}
                      />
                    ) : (
                      <Image
                        id="preview"
                        src={"https://placehold.co/700x400"}
                        boxSize={{ base: "100%" }}
                        aspectRatio={"2 / 1"}
                      />
                    )}

                    <FormControl w={{ base: "100%", sm: "fit-content" }}>
                      <FormLabel htmlFor="name">
                        Upload Driver's License
                      </FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        {...register("requirement", {
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
                      <FormErrorMessage></FormErrorMessage>
                    </FormControl>
                  </Box>
                  <Box
                    display={"flex"}
                    flexDirection={"start"}
                    w={"100%"}
                    gap={"24px"}
                    flexWrap={"wrap"}
                    mb="12px"
                    mt={"24px"}
                  >
                    <FormControl w={{ base: "100%", sm: "fit-content" }}>
                      <FormLabel htmlFor="name">Upload Resume</FormLabel>
                      <Input
                        type="file"
                        accept="application/pdf"
                        {...register("resume", {
                          validate: (value) => {
                            const types = ["application/pdf"];
                            if (value.length > 0) {
                              if (!types.includes(value[0]?.type)) {
                                return "Invalid file format. Only PDF is allowed.";
                              }

                              if (value[0]?.size > 5242880) {
                                return "File is too large. Upload images with a size of 5MB or below.";
                              }
                            }

                            return true;
                          },
                        })}
                      />
                      <FormErrorMessage></FormErrorMessage>
                    </FormControl>
                  </Box>
                </>
              ) : (
                <>
                  <Box>
                    <Text fontWeight={"600"}>Items</Text>
                    {selectedItem.items &&
                      selectedItem.items.map((item) => (
                        <HStack
                          paddingBlock={4}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                          w={"100%"}
                          flexWrap={"wrap"}
                          key={item.id}
                        >
                          <HStack gap={4} w={"50%"}>
                            <Image
                              src={item.image}
                              boxSize={"50px"}
                              borderRadius={"lg"}
                            />
                            <Box>
                              <Text fontSize={"md"} fontWeight={"medium"}>
                                {item.productName}
                              </Text>
                              <Text fontSize={"md"}>
                                {item.discountedPrice}
                              </Text>
                            </Box>
                          </HStack>
                          <HStack>
                            <Text fontSize={"md"}>x {item.quantity}</Text>
                          </HStack>
                        </HStack>
                      ))}
                  </Box>
                  <VStack alignItems={"end"}>
                    <Text>
                      <b>Payment Method:</b> {selectedItem.paymentMethod}
                    </Text>
                    <Text>
                      <b>Subtotal:</b> {selectedItem.subtotal}
                    </Text>
                    <Text>
                      <b>Shipping Fee:</b>{" "}
                      {selectedItem.total - selectedItem.subtotal}
                    </Text>
                    <Text>
                      <b>Total:</b> {selectedItem.total}
                    </Text>
                  </VStack>
                </>
              )}
            </ModalBody>
            {type === "update" && (
              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  isLoading={setProcessLoading}
                  type="submit"
                >
                  Update
                </Button>
              </ModalFooter>
            )}
          </ModalContent>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default Courier;

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const userSession = req.session.user;

  if (!userSession) {
    return {
      redirect: {
        permanent: false,
        destination: "/role/courier/auth/login",
      },
    };
  }

  if (userSession.role != "courier") {
    return {
      notFound: true,
    };
  }

  let order = null;

  if (userSession.order != null && userSession.order != undefined) {
    order = await getCurrentOrder(userSession.order);
  }

  const { availableOrderCount, finishedOrderCount } =
    await getCourierDashboardCount(userSession.email);

  return {
    props: { userSession, availableOrderCount, finishedOrderCount, order },
  };
});
