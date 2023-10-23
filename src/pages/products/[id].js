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

const ProductDetails = ({ product, products }) => {
  const { addToCart } = useCartStore();

  return (
    <>
      <Layout metaTitle={`IT Kim - ${product.productName}`}>
        <Container
          maxW={"7xl"}
          minHeight={"100vh"}
          display={"grid"}
          placeItems={"center"}
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
            <Stack spacing={{ base: 6, md: 10 }}>
              <Box as={"header"}>
                <Heading
                  lineHeight={1.1}
                  fontWeight={600}
                  fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
                >
                  {product.productName}
                </Heading>
                <HStack>
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
                  </Text>
                </HStack>
              </Box>

              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={"column"}
                divider={
                  <StackDivider
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                  />
                }
              >
                <VStack spacing={{ base: 4, sm: 6 }}>
                  <Text
                    color={useColorModeValue("gray.500", "gray.400")}
                    fontSize={"2xl"}
                    fontWeight={"300"}
                  >
                    {product.description}
                  </Text>
                </VStack>
              </Stack>

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
            </Stack>
          </SimpleGrid>
        </Container>
        <FeaturedProducts products={products} fromVendor={products[0].vendor} />
      </Layout>
    </>
  );
};

export default ProductDetails;

export async function getServerSideProps(context) {
  const id = context.params.id;
  let product = [];
  const productSnapshot = await getDoc(doc(firestore, "products", id));

  if (productSnapshot.exists) {
    product = productSnapshot.data();

    const moreProductResponse = await getDocs(
      query(
        collection(firestore, "products"),
        where("vendorUID", "==", product.vendorUID),
        limit(3)
      )
    );

    const products = !moreProductResponse.empty
      ? moreProductResponse.docs
          .map((doc) => {
            const returnDoc = doc.data();
            returnDoc.id = doc.id;

            return returnDoc;
          })
          .filter((product) => product.id != id)
      : [];

    return {
      props: { product, products },
    };
  } else {
    return {
      props: { product, products },
    };
  }
}
