import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useCartStore } from "@/hooks/stores/cartStore";
import {
  Box,
  Text,
  Flex,
  HStack,
  Image,
  Button,
  Input,
  Heading,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  VStack,
  Stack,
  Link,
  useToast,
} from "@chakra-ui/react";
import { IoBagCheckOutline } from "react-icons/io5";
import { getSession } from "next-auth/react";
import { firestore } from "../../../firebase-config";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Checkout({ userSession }) {
  const router = useRouter();
  const vendorUID = router.query.id;

  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    userSession ? userSession.user.addresses[0] : {}
  );
  const { cart, removeItemsByVendorId } = useCartStore();

  const checkout = async () => {
    try {
      setLoading(true);
      const selectedCart = cart.filter(
        (vendor) => vendor.vendorUID === vendorUID
      );
      console.log(selectedCart[0], selectedAddress);

      const orderData = {
        vendorId: selectedCart[0].vendorUID,
        vendor: selectedCart[0].vendor,
        items: selectedCart[0].items,
        address: selectedAddress,
        customerId: userSession.user.docId,
        customerName: userSession.user.name,
        status: "order-placed",
      };

      const order = await firestore.collection("orders").add(orderData);

      console.log(order);
      if (order) {
        removeItemsByVendorId(vendorUID);
        // Success
        toast({
          title: "Checkout successful.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Layout metaTitle={"IT Kim - Checkout"}>
        <Box
          maxW={"720"}
          marginInline={"auto"}
          paddingTop={"120px"}
          minH={"100vh"}
        >
          <Box
            border={"1px"}
            borderColor={"gray.100"}
            padding={8}
            borderRadius={"lg"}
            boxShadow={"md"}
          >
            <Heading mb={"20px"}>Checkout</Heading>
            {userSession != null ? (
              <Stack>
                {userSession && userSession.user.addresses.length > 0 ? (
                  <FormControl mb={"16px"}>
                    <HStack
                      justifyContent={"space-between"}
                      alignItems={"end"}
                      mb={"12px"}
                    >
                      <Text>Address</Text>
                      <Button
                        variant={"primary"}
                        size={"sm"}
                        as={Link}
                        href={"/customer/profile"}
                      >
                        Add address
                      </Button>
                    </HStack>
                    <Select onChange={setSelectedAddress}>
                      {userSession.user.addresses.map((address) => (
                        <option value={address}>
                          {address.address.no} {address.address.street},
                          {address.address.barangay}, {address.address.city}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <HStack>
                    <FormControl mb={"16px"}>
                      <FormLabel>Address</FormLabel>
                      <HStack w={"100%"} justifyContent={"space-between"}>
                        <Text>No Address Found</Text>
                        <Button
                          variant={"primary"}
                          size={"sm"}
                          as={Link}
                          href={"/customer/profile"}
                        >
                          Add address
                        </Button>
                      </HStack>
                    </FormControl>
                  </HStack>
                )}
              </Stack>
            ) : (
              <Stack spacing={1} mb={"16px"}>
                <Text fontWeight={"bold"}>Sign in to checkout</Text>
                <Button
                  onClick={() => {
                    signIn("google");
                  }}
                  leftIcon={<FcGoogle />}
                >
                  Sign in with Google
                </Button>
              </Stack>
            )}

            {cart.map(
              (vendor) =>
                vendor.vendorUID === vendorUID && <Items items={vendor.items} />
            )}

            <HStack justifyContent={"end"}>
              <Button
                variant={"primary"}
                rightIcon={<IoBagCheckOutline />}
                disabled={!userSession}
                onClick={checkout}
                loading={loading}
              >
                Checkout
              </Button>
            </HStack>
          </Box>
        </Box>
      </Layout>
    </>
  );
}

const Items = ({ items }) => {
  return (
    <Flex w={"100%"} flexDirection={"column"}>
      {items.length > 0 &&
        items.map((product, index) => (
          <HStack
            paddingBlock={4}
            alignItems={"center"}
            justifyContent={"space-between"}
            w={"100%"}
            flexWrap={"wrap"}
          >
            <HStack gap={4} w={"50%"}>
              <Image src={product.image} boxSize={"50px"} borderRadius={"lg"} />
              <Box>
                <Text fontSize={"md"} fontWeight={"medium"}>
                  {product.productName}
                </Text>
                <Text fontSize={"md"}>{product.discountedPrice}</Text>
              </Box>
            </HStack>
            <HStack w={"40%"}>
              <Button
                size={"sm"}
                onClick={() => updateQuantity(product.id, product.quantity + 1)}
              >
                +
              </Button>
              <Input
                size={"sm"}
                value={product.quantity}
                onChange={(e) => updateQuantity(product.id, e.target.value)}
              />
              <Button
                size={"sm"}
                onClick={() => updateQuantity(product.id, product.quantity - 1)}
              >
                -
              </Button>
            </HStack>
          </HStack>
        ))}
    </Flex>
  );
};

export async function getServerSideProps(context) {
  const userSession = await getSession(context);
  const id = context.query.id;

  if (userSession) {
    const response = await firestore
      .collection("users")
      .where("email", "==", userSession.user.email)
      .limit(1)
      .get();

    const userDoc = !response.empty ? response.docs[0].data() : {};
    userSession.user.addresses = userDoc.addresses ? userDoc.addresses : [];
    userSession.user.docId = response.docs[0].id;

    return {
      //   redirect: {
      //     permanent: true,
      //     destination: `/checkout/${id}`,
      //   },
      props: { userSession },
    };
  } else {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: { providers: [] },
    };
  }
}
