import {
  Center,
  Box,
  Image,
  Text,
  Heading,
  Stack,
  useColorModeValue,
  Button,
  Icon,
  Link,
  HStack,
} from "@chakra-ui/react";
import {
  AiOutlineShoppingCart,
  AiOutlineStar,
  AiFillStar,
} from "react-icons/ai";
import { useCartStore } from "@/hooks/stores/cartStore";
const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();

  const addToCartNotLink = (e, product) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      _hover={{ textDecoration: "none" }}
      height={"100%"}
    >
      <Center py={12} height={"100%"}>
        <Box
          role={"group"}
          p={6}
          maxW={"330px"}
          w={"full"}
          bg={useColorModeValue("white", "gray.800")}
          boxShadow={"2xl"}
          rounded={"lg"}
          pos={"relative"}
          zIndex={1}
          height={"100%"}
        >
          <Box
            rounded={"lg"}
            mt={-12}
            pos={"relative"}
            height={"200"}
            _after={{
              transition: "all .3s ease",
              content: '""',
              w: "full",
              h: "full",
              pos: "absolute",
              top: 5,
              left: 0,
              backgroundImage: `url(${product.image})`,
              filter: "blur(15px)",
              zIndex: -1,
            }}
            _groupHover={{
              _after: {
                filter: "blur(20px)",
              },
            }}
          >
            <Image
              rounded={"lg"}
              height={200}
              width={"100%"}
              objectFit={"cover"}
              src={product.image}
              alt="#"
            />
          </Box>
          <Stack pt={10} align={"center"}>
            <Text
              color={"gray.500"}
              fontSize={"sm"}
              textTransform={"uppercase"}
            >
              {product.vendor}
            </Text>
            <Heading fontSize={"2xl"} fontFamily={"body"} fontWeight={500}>
              {product.productName}
            </Heading>
            <HStack>
              <AiFillStar fill="gold" />
              <AiFillStar fill="gold" />
              <AiFillStar fill="gold" />
              <AiFillStar fill="gold" />
              <AiFillStar fill="gold" />
            </HStack>
            <Stack direction={"row"} align={"center"}>
              <Text fontWeight={800} fontSize={"xl"}>
                ₱{product.discountedPrice}
              </Text>
              <Text textDecoration={"line-through"} color="red.200">
                ₱{product.price}
              </Text>
            </Stack>
            <Button
              mt={"12px"}
              variant={"primary"}
              size="md"
              rightIcon={<Icon as={AiOutlineShoppingCart} />}
              onClick={(e) => addToCartNotLink(e, product)}
            >
              Add to Cart
            </Button>
          </Stack>
        </Box>
      </Center>
    </Link>
  );
};

export default ProductCard;
