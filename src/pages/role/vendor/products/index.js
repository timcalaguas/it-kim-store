import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../firebase-config";
import { getSession } from "next-auth/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import { AiTwotoneEdit, AiFillDelete, AiFillEye } from "react-icons/ai";
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
  Text,
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
import { withSessionSsr } from "@/lib/withSession";
import getVendorsProducts from "@/hooks/products/getVendorProducts";
import { AiFillStar } from "react-icons/ai";
import Link from "next/link";

import { FaPesoSign } from "react-icons/fa6";
import { AiFillShopping } from "react-icons/ai";
import { BsFillCartCheckFill } from "react-icons/bs";
const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/vendor" },
  { name: "Products", icon: AiFillShopping, link: "/role/vendor/products" },
  { name: "Orders", icon: BsFillCartCheckFill, link: "/role/vendor/orders" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/vendor/sales-report" },
];

const Products = ({ productDocs, user }) => {
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
        user={user}
        LinkItems={LinkItems}
      >
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>List of Products</Heading>
          {user.status != "approved" ? (
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
                  <Th>Rating</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((product) => (
                  <Tr key={product.id}>
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
                      {product.averageStarRating != null &&
                      product.averageStarRating != undefined ? (
                        <HStack>
                          <Text>{product.averageStarRating}</Text>
                          <AiFillStar fill="gold" />
                        </HStack>
                      ) : (
                        "No Rating yet"
                      )}
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={2}>
                        <Button
                          as={Link}
                          leftIcon={<AiFillEye />}
                          colorScheme="blue"
                          variant="outline"
                          size={"sm"}
                          href={`/role/vendor/products/${product.id}`}
                        >
                          View
                        </Button>
                        <Button
                          as={Link}
                          leftIcon={<AiTwotoneEdit />}
                          colorScheme="blue"
                          variant="outline"
                          size={"sm"}
                          href={`/role/vendor/products/edit/${product.id}`}
                        >
                          Edit
                        </Button>
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

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const user = req.session.user ? req.session.user : null;

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/role/vendor/auth/login",
      },
    };
  }

  if (user.role != "vendor") {
    return {
      notFound: true,
    };
  }

  const { productDocs } = await getVendorsProducts(user.docId);

  return {
    props: { productDocs, user },
  };
});
