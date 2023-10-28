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
  Link,
  Alert,
  AlertIcon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalOverlay,
} from "@chakra-ui/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import { getSession } from "next-auth/react";
import { firestore } from "../../../../firebase-config";
import {
  BsCartCheckFill,
  BsFillCartCheckFill,
  BsFillCartFill,
} from "react-icons/bs";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/courier" },
  { name: "Orders", icon: FiTrendingUp, link: "/role/courier/orders" },
];

const Courier = ({ userSession }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <AdminLayout
      metaTitle={"IT Kim - Courier"}
      pageName="Courier"
      user={userSession}
      LinkItems={LinkItems}
    >
      <Box>
        {(userSession.user.storeName == "" ||
          userSession.user.addresses.length == 0) && (
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
                  src={userSession.user.storeLogo}
                  name={userSession.user.storeName}
                  boxSize={"200px"}
                />
                <Tag
                  size="lg"
                  colorScheme={
                    userSession.user.status === "approved" ? "green" : "orange"
                  }
                  borderRadius="full"
                  marginBlock={"12px"}
                >
                  {userSession.user.status === "approved" ? (
                    <TagLabel textTransform={"uppercase"}>
                      {userSession.user.status}
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
                  <Text fontWeight={"bold"}>Name:</Text>
                  <Text>{userSession.user.name}</Text>
                </Box>
                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Address:</Text>
                  <Text>
                    {userSession.user.addresses.length > 0
                      ? `${userSession.user.addresses[0].address.no} ${userSession.user.addresses[0].address.street} ${userSession.user.addresses[0].address.barangay} ${userSession.user.addresses[0].address.city}`
                      : ""}
                  </Text>
                </Box>
                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Contact No.:</Text>
                  <Text>
                    {userSession.user.addresses.length > 0
                      ? userSession.user.addresses[0].contactNumber
                      : ""}
                  </Text>
                </Box>

                <Box mb={"12px"}>
                  <Text fontWeight={"bold"}>Email:</Text>
                  <Text>{userSession.user.email}</Text>
                </Box>
              </Box>
            </HStack>
          </CardBody>
        </Card>
        <Box
          border={"1px"}
          borderColor={"gray.200"}
          padding={"16px"}
          borderRadius={"xl"}
          bg={"white"}
          minH={"200px"}
        >
          <Text mb="12px" fontWeight={"700"} fontSize={"2xl"}>
            Current Delivery
          </Text>
          <Box>
            <Text fontWeight={"600"}>Order</Text>
            <HStack>
              <Box p={5} border={"1px"} borderColor={"gray.100"}>
                <Text fontWeight={"500"}>Customer Info</Text>
                <Text>Name: Lebron James</Text>
                <Text>Address: Lebron James</Text>
                <Text>Email: Lebron James</Text>
              </Box>
              <Box p={5} border={"1px"} borderColor={"gray.100"}>
                <Text fontWeight={"500"}>Customer Info</Text>
                <Text>Name: Lebron James</Text>
                <Text>Address: Lebron James</Text>
                <Text>Email: Lebron James</Text>
              </Box>
            </HStack>
          </Box>
          {/* <Box display={"grid"} placeItems={"center"} gap={"12px"}>
            <Text fontWeight={"700"} fontSize={"3xl"}>
              No Order selected
            </Text>
            <Button
              as={Link}
              href="/role/courier/orders/available"
              colorScheme="blue"
              _hover={{ textDecor: "none" }}
            >
              View Available Orders
            </Button>
          </Box> */}
        </Box>
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
                  <Heading size={"4xl"}>5</Heading>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </Flex>
      </Box>
      {/* <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
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
                {storeLogo == "" ? (
                  <Image
                    id="preview"
                    src={
                      previewImage == ""
                        ? "https://placehold.co/400x400"
                        : URL.createObjectURL(selectedFile[0])
                    }
                    boxSize={{ base: "100%", sm: "200px" }}
                  />
                ) : (
                  <Image
                    id="preview"
                    src={storeLogo}
                    boxSize={{ base: "100%", sm: "200px" }}
                  />
                )}

                <FormControl
                  isInvalid={errors.image}
                  w={{ base: "100%", sm: "fit-content" }}
                >
                  <FormLabel htmlFor="name">Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("storeLogo", {
                      validate: (value) => {
                        const types = ["image/png", "image/jpeg", "image/jpg"];
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
                    {errors.image && errors.image.message}
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
      </Modal> */}
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
