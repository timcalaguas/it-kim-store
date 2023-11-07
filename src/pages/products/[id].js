import Layout from "@/components/Layout";
import { firestore } from "../../../firebase-config";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
} from "firebase/firestore";
import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  Image,
  Flex,
  VStack,
  Button,
  Heading,
  SimpleGrid,
  StackDivider,
  useColorModeValue,
  VisuallyHidden,
  List,
  ListItem,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useCartStore } from "@/hooks/stores/cartStore";
import FeaturedProducts from "@/components/FeaturedProducts";
import getSingleProduct from "@/hooks/products/getSingleProduct";
import { withSessionSsr } from "@/lib/withSession";
import ProductRatings from "@/components/ProductRatings";
import StarRating from "@/components/StarRating";

const ProductDetails = ({ products, product, user }) => {
  const { addToCart } = useCartStore();

  console.log(product, products);

  return (
    <>
      <Layout metaTitle={`IT Kim - ${product.productName}`} user={user}>
        <Container
          maxW={"7xl"}
          minHeight={"100vh"}
          display={"grid"}
          placeItems={"center"}
          paddingTop={"120px"}
        >
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 8, md: 10 }}
            py={{ base: 18, md: "120px" }}
          >
            <Flex>
              <Image
                rounded={"md"}
                alt={"product image"}
                src={product.image}
                fit={"cover"}
                align={"center"}
                w={"100%"}
                h={{ base: "100%", sm: "400px", lg: "500px" }}
              />
            </Flex>
            <Stack spacing={{ base: 6, md: 6 }}>
              <Box as={"header"}>
                <Heading
                  lineHeight={1.1}
                  fontWeight={600}
                  fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
                  mb={"12px"}
                >
                  {product.productName}
                </Heading>
                <StarRating rating={product.averageStarRating} />
                <HStack mt={"12px"}>
                  {product.discountedPrice != "" &&
                  product.discountedPrice != undefined &&
                  product.discountedPrice != null ? (
                    <>
                      <Text
                        color={useColorModeValue("gray.900", "gray.400")}
                        fontWeight={300}
                        fontSize={"2xl"}
                      >
                        ₱{product.discountedPrice}
                      </Text>
                      <Text
                        color={useColorModeValue("red.200", "red.400")}
                        fontWeight={300}
                        fontSize={"2xl"}
                        textDecoration={"line-through"}
                      >
                        ₱{product.price}
                      </Text>{" "}
                    </>
                  ) : (
                    <Text
                      color={useColorModeValue("gray.900", "gray.400")}
                      fontWeight={300}
                      fontSize={"2xl"}
                    >
                      ₱{product.price}
                    </Text>
                  )}
                </HStack>
              </Box>
              <Button
                variant={"primary"}
                rightIcon={<Icon as={AiOutlineShoppingCart} />}
                onClick={() => addToCart(product)}
                rounded={"none"}
                w={"full"}
                mt={8}
                size={"lg"}
                py={"7"}
                borderRadius={"lg"}
                textTransform={"uppercase"}
                _hover={{
                  transform: "translateY(2px)",
                  boxShadow: "lg",
                }}
              >
                Add to cart
              </Button>
              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={"column"}
                divider={
                  <StackDivider
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                  />
                }
              >
                <Text
                  color={useColorModeValue("gray.500", "gray.400")}
                  fontSize={"2xl"}
                  fontWeight={"300"}
                >
                  {product.description}
                </Text>
              </Stack>
            </Stack>
          </SimpleGrid>
        </Container>
        {product.rating.length > 0 && (
          <ProductRatings ratings={product.rating} />
        )}
        {products.length > 0 && (
          <FeaturedProducts products={products} fromVendor={product.vendor} />
        )}
      </Layout>
    </>
  );
};

export default ProductDetails;

export const getServerSideProps = withSessionSsr(async (context) => {
  const { req } = context;
  const user = req.session.user ? req.session.user : null;

  const id = context.params.id;
  const { products, product } = await getSingleProduct(id);

  console.log(product);

  return {
    props: { product, products, user },
  };
});
