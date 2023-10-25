import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../firebase-config";
import { getSession } from "next-auth/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import { AiTwotoneEdit, AiFillDelete, AiFillCheckCircle } from "react-icons/ai";
import { IoIosAddCircle } from "react-icons/io";
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
  Link,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Alert,
  AlertIcon,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";

const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/vendor" },
  { name: "Products", icon: FiTrendingUp, link: "/role/vendor/products" },
  { name: "Orders", icon: FiCompass, link: "/role/vendor/orders" },
];

const Products = ({ productDocs, userSession }) => {
  const toast = useToast();

  const [products, setProducts] = useState(productDocs);
  const [selectedId, setSelectedId] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const openDeleteDialog = (id) => {
    setSelectedId(id);
    onOpen();
  };

  const [alertOpen, setAlertOpen] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteProduct = async () => {
    setDeleteLoading(true);
    const response = await firestore
      .collection("products")
      .doc(selectedId)
      .delete();
    setDeleteLoading(false);
    const filtered = products.filter((item) => item.id != selectedId);
    setProducts(filtered);
    onClose();
    toast({
      title: "Product deleted.",
      description: "The product is successfully deleted.",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  };

  return (
    <>
      <AdminLayout
        metaTitle={"Vendor - Products"}
        pageName={"IT Kim - Vendor"}
        user={userSession}
        LinkItems={LinkItems}
      >
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>List of Products</Heading>
          {userSession.user.status != "approved" ? (
            <Button
              leftIcon={<IoIosAddCircle />}
              colorScheme="blue"
              variant="solid"
              onClick={() => setAlertOpen(true)}
            >
              Add Product
            </Button>
          ) : (
            <Link href={"/role/vendor/products/add"}>
              <Button
                leftIcon={<IoIosAddCircle />}
                colorScheme="blue"
                variant="solid"
              >
                Add Product
              </Button>
            </Link>
          )}
        </HStack>
        {alertOpen && (
          <Alert status="warning" mb={"12px"}>
            <AlertIcon />
            Your account's approval is still pending. Please wait till the Admin
            to approve your account.
          </Alert>
        )}
        <TableContainer
          background={"white"}
          p={{ base: 2, md: 5 }}
          borderRadius={6}
        >
          {products.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Product Name</Th>
                  <Th>Price</Th>
                  <Th>Discounted Price</Th>
                  <Th>Quantity</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((product) => (
                  <Tr>
                    <Td>
                      <HStack spacing={4}>
                        <Image
                          borderRadius="full"
                          boxSize={"32px"}
                          src={product.image}
                          alt="Dan Abramov"
                        />
                        <Box>{product.productName}</Box>
                      </HStack>
                    </Td>
                    <Td>{product.price}</Td>
                    <Td>{product.discountedPrice}</Td>
                    <Td>{product.quantity}</Td>
                    <Td>
                      <Stack direction="row" spacing={2}>
                        <Link href={`/role/vendor/products/edit/${product.id}`}>
                          <Button
                            leftIcon={<AiTwotoneEdit />}
                            colorScheme="blue"
                            variant="outline"
                            size={"sm"}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          leftIcon={<AiFillDelete />}
                          colorScheme="red"
                          size={"sm"}
                          variant="outline"
                          onClick={() => openDeleteDialog(product.id)}
                        >
                          Delete
                        </Button>
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
              <Heading>No products yet</Heading>
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
              Delete Product
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={deleteProduct}
                ml={3}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Products;

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

  const userDoc = !response.empty ? response.docs[0].data() : {};
  userSession.user.addresses = userDoc.addresses ? userDoc.addresses : [];
  userSession.user.docId = response.docs[0].id;
  userSession.user.status = userDoc.status ? userDoc.status : "";

  const productResponse = await firestore.collection("products").get();

  let productDocs = !productResponse.empty
    ? productResponse.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;

        return returnDoc;
      })
    : [];

  const filteredArray = productDocs.filter(
    (obj) => obj.vendorUID === userSession.user.docId
  );

  productDocs = filteredArray;

  return {
    props: { productDocs, userSession },
  };
}
