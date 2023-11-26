import AdminLayout from "@/components/AdminLayout";
import { firestore } from "../../../../../firebase-config";
import { getSession } from "next-auth/react";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
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
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Alert,
  Avatar,
  AlertIcon,
  useDisclosure,
  useToast,
  Card,
  CardBody,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { withSessionSsr } from "@/lib/withSession";
import getSingleProduct from "@/hooks/products/getSingleProduct";
import ProductCard from "@/components/ProductCard";
import StarRating from "@/components/StarRating";

import { FaPesoSign } from "react-icons/fa6";
import { AiFillShopping } from "react-icons/ai";
import { BsFillCartCheckFill } from "react-icons/bs";
const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/vendor" },
  { name: "Products", icon: AiFillShopping, link: "/role/vendor/products" },
  { name: "Orders", icon: BsFillCartCheckFill, link: "/role/vendor/orders" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/vendor/sales-report" },
];

const Products = ({ productDoc, user }) => {
  const toast = useToast();

  const [product, setProduct] = useState(productDoc);
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
        name={product.productName}
      >
        <Card>
          <CardBody>
            <HStack alignItems={"start"} gap={"24px"} flexWrap={"wrap"}>
              <Box>
                <ProductCard product={product} key={product.id} vendor={true} />
              </Box>
              <Box w={{ base: "100%", "2xl": "70%" }}>
                <Heading mb={"24px"}>Product Ratings</Heading>
                {product.rating.length > 0 ? (
                  <VStack alignItems={"start"} w={"100%"}>
                    {product.rating.length > 0 &&
                      product.rating.map((rating) => (
                        <Box
                          padding={"16px"}
                          border={"1px"}
                          borderColor={"gray.200"}
                          w={"100%"}
                          display={"flex"}
                          flexDir={"column"}
                          gap={"12px"}
                        >
                          <HStack>
                            <Avatar boxSize={"50px"} src={rating.user.image} />
                            <Box>
                              <Text>{rating.user.name}</Text>
                              <Text>{rating.user.email}</Text>
                            </Box>
                          </HStack>
                          <Box>
                            <HStack>
                              <Text>Rating:</Text>{" "}
                              <StarRating rating={rating.stars} />
                            </HStack>
                            <HStack>
                              <Text>Comment:</Text>

                              <Text>{rating.comment}</Text>
                            </HStack>
                          </Box>
                        </Box>
                      ))}
                  </VStack>
                ) : (
                  <Box>
                    <Text>No Ratings yet</Text>
                  </Box>
                )}
              </Box>
            </HStack>
          </CardBody>
        </Card>
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

export const getServerSideProps = withSessionSsr(async (context) => {
  const { req } = context;
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

  const id = context.params.id;
  const { product } = await getSingleProduct(id);
  const productDoc = product;

  return {
    props: { productDoc, user },
  };
});
