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
  Stack,
  Link,
  useToast,
  VStack,
  Checkbox,
} from "@chakra-ui/react";
import { IoBagCheckOutline } from "react-icons/io5";
import { firestore } from "../../../firebase-config";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState } from "react";
import { withSessionSsr } from "@/lib/withSession";
import AuthManager from "@/hooks/auth/AuthManager";
import moment from "moment";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";

export default function Checkout({ userSession }) {
  const router = useRouter();
  const vendorUID = router.query.id;

  const { loginWithGoogle } = AuthManager();

  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    userSession ? userSession.addresses[0] : {}
  );

  const { cart, removeItemsByVendorId, calculateSubtotal } = useCartStore();

  const changeAddress = (index) => {
    setSelectedAddress(userSession.addresses[index]);
  };

  const selectedCart = cart.filter((vendor) => vendor.vendorUID === vendorUID);

  const [checked, setChecked] = useState(false);

  const checkout = async () => {
    try {
      setLoading(true);
      const selectedCart = cart.filter(
        (vendor) => vendor.vendorUID === vendorUID
      );

      if (
        selectedAddress.contactNumber !== "" &&
        selectedAddress.address.no &&
        selectedAddress.address.street &&
        selectedAddress.address.barangay &&
        selectedAddress.address.city
      ) {
        const orderData = {
          vendorId: selectedCart[0].vendorUID,
          vendor: selectedCart[0].vendor,
          items: selectedCart[0].items,
          customer: {
            id: userSession.docId,
            name: userSession.name,
            email: userSession.email,
            address: selectedAddress,
            picture: userSession.picture,
          },
          status: "order-placed",
          total: calculateSubtotal(vendorUID) + 30,
          subtotal: calculateSubtotal(vendorUID),
          date: moment(new Date()).format("MM-DD-YYYY"),
        };

        const order = await firestore.collection("orders").add(orderData);

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
          router.push("/");
        }
      } else {
        setLoading(false);
        toast({
          title: "Please fill up your address correctly.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log(
    userSession == null,
    !checked,
    userSession != null && userSession.addresses.length > 0,
    (userSession == null,
    !checked,
    userSession != null && userSession.addresses.length > 0)
  );

  return (
    <>
      <Layout metaTitle={"IT Kim - Checkout"} user={userSession}>
        <Box
          w={"100%"}
          height={"100%"}
          bg={"url(/wave.svg)"}
          bgRepeat={"no-repeat"}
          bgPos={"bottom"}
        >
          <Box
            maxW={"720"}
            marginInline={"auto"}
            paddingTop={"120px"}
            minH={"100vh"}
            bg={"/wave.svg"}
          >
            <Box
              border={"1px"}
              borderColor={"gray.100"}
              padding={8}
              borderRadius={"lg"}
              boxShadow={"md"}
              bg={"white"}
            >
              <Heading mb={"20px"}>Checkout</Heading>
              {userSession != null ? (
                <>
                  <Box mb={"20px"}>
                    <Box display={"flex"} gap={"5px"}>
                      <Text fontWeight={"600"}>Name:</Text> {userSession.name}
                    </Box>
                    <Box display={"flex"} gap={"5px"}>
                      <Text fontWeight={"600"}>Email:</Text> {userSession.email}
                    </Box>
                    <Box display={"flex"} gap={"5px"}>
                      <Text fontWeight={"600"}>Address:</Text>{" "}
                      {selectedAddress?.address.no}{" "}
                      {selectedAddress?.address.street}{" "}
                      {selectedAddress?.address.barangay}{" "}
                      {selectedAddress?.address.city}
                    </Box>
                    <Box display={"flex"} gap={"5px"}>
                      <Text fontWeight={"600"}>Contact Number:</Text>{" "}
                      {selectedAddress?.contactNumber}
                    </Box>
                  </Box>

                  <Stack>
                    {userSession && userSession.addresses.length > 0 ? (
                      <FormControl mb={"16px"}>
                        <HStack
                          justifyContent={"space-between"}
                          alignItems={"end"}
                          mb={"12px"}
                        >
                          <Text fontWeight={"600"}>Select Address</Text>
                          <Button
                            variant={"primary"}
                            size={"sm"}
                            as={Link}
                            href={"/customer/profile"}
                          >
                            Add address
                          </Button>
                        </HStack>
                        <Select onChange={(e) => changeAddress(e.target.value)}>
                          {userSession.addresses.map((address, index) => (
                            <option value={index}>
                              {address.address.no} {address.address.street},
                              {address.address.barangay}, {address.address.city}{" "}
                              - {address.contactNumber}
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
                </>
              ) : (
                <Stack spacing={1} mb={"16px"}>
                  <Text fontWeight={"bold"}>Sign in to checkout</Text>
                  <Button
                    onClick={() => loginWithGoogle("customer")}
                    leftIcon={<FcGoogle />}
                  >
                    Sign in with Google
                  </Button>
                </Stack>
              )}

              <Box>
                {selectedCart.map((vendor) => {
                  return <Items items={vendor.items} />;
                })}
              </Box>
              <VStack textAlign={"left"} alignItems={"start"}>
                <Text>
                  Once the seller has approved your product, there's no refund
                  available for it.
                </Text>
                <Checkbox
                  onChange={(e) => setChecked(e.target.checked)}
                  value={checked}
                >
                  Check the box to agree to our No Refund Policy in our terms.
                </Checkbox>
              </VStack>
              <VStack
                fontWeight={"600"}
                alignItems={"end"}
                paddingBlock={"12px"}
              >
                <Text>Subtotal: {calculateSubtotal(vendorUID)}</Text>
                <Text>Shipping fee: 30</Text>
                <Text>Total: {calculateSubtotal(vendorUID) + 30}</Text>
              </VStack>

              <HStack justifyContent={"end"}>
                <Button
                  variant={"primary"}
                  rightIcon={<IoBagCheckOutline />}
                  isDisabled={
                    userSession == null ||
                    !checked ||
                    (userSession != null && userSession.addresses.length == 0)
                  }
                  onClick={checkout}
                  isLoading={loading}
                >
                  Place order
                </Button>
              </HStack>
            </Box>
          </Box>
        </Box>
      </Layout>
    </>
  );
}

const Items = ({ items }) => {
  const { updateQuantity, removeItemsByVendorId } = useCartStore();
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
            key={product.id}
          >
            <HStack gap={4} w={{ base: "100%", sm: "40%" }}>
              <Image src={product.image} boxSize={"50px"} borderRadius={"lg"} />
              <Box
                display={{ base: "flex", sm: "block" }}
                justifyContent={"space-between"}
                w={"100%"}
                pr={{ base: "8px", sm: "0" }}
              >
                <Text fontSize={"md"} fontWeight={"medium"}>
                  {product.productName}
                </Text>
                <Text fontSize={"md"}>{product.discountedPrice}</Text>
              </Box>
            </HStack>
            <HStack w={{ base: "100%", sm: "40%" }} justifyContent={"center"}>
              <Button
                size={"sm"}
                onClick={() => updateQuantity(product.id, product.quantity + 1)}
              >
                <FaPlus />
              </Button>
              <Box w={"25px"} placeItems={"center"} display={"grid"}>
                {product.quantity}
              </Box>
              <Button
                size={"sm"}
                onClick={() => updateQuantity(product.id, product.quantity - 1)}
              >
                <FaMinus />
              </Button>
              <Button size={"sm"} onClick={() => updateQuantity(product.id, 0)}>
                <FaTrash />
              </Button>
            </HStack>
          </HStack>
        ))}
    </Flex>
  );
};

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
  const userSession = req.session.user ? req.session.user : null;

  return {
    props: { userSession },
  };
});
