import {
  Drawer,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerFooter,
  DrawerContent,
  DrawerBody,
  Button,
  Flex,
  Card,
  Box,
  Divider,
  Text,
  HStack,
  Image,
  Input,
  Heading,
} from "@chakra-ui/react";
import { useCartStore } from "@/hooks/stores/cartStore";
import { IoBagCheckOutline } from "react-icons/io5";
import { useRouter } from "next/router";

const Cart = ({ cart, isOpen, onClose, btnRef }) => {
  const { updateQuantity } = useCartStore();
  const router = useRouter();

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent width={"100%"} maxW={"450px"}>
          <DrawerCloseButton />
          <DrawerHeader>
            <Heading fontSize={"2xl"}>Cart</Heading>
          </DrawerHeader>
          <DrawerBody>
            {cart.length > 0 ? (
              cart.map(({ vendorUID, vendor, items }) => (
                <Box key={vendorUID}>
                  <Flex
                    flexDirection={"column"}
                    w={"100%"}
                    p={"8px"}
                    borderRadius={"md"}
                    border={"1px"}
                    borderColor={"gray.200"}
                    marginBottom={"16px"}
                  >
                    <Text fontSize={"xl"} fontWeight={"bold"}>
                      {vendor}
                    </Text>
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
                            <HStack gap={4} w={"50%"}>
                              <Image
                                src={product.image}
                                boxSize={"50px"}
                                borderRadius={"lg"}
                              />
                              <Box>
                                <Text fontSize={"md"} fontWeight={"medium"}>
                                  {product.productName}
                                </Text>
                                <Text fontSize={"md"}>
                                  {product.discountedPrice}
                                </Text>
                              </Box>
                            </HStack>
                            <HStack w={"40%"}>
                              <Button
                                size={"sm"}
                                onClick={() =>
                                  updateQuantity(
                                    product.id,
                                    product.quantity + 1
                                  )
                                }
                              >
                                +
                              </Button>
                              <Input
                                size={"sm"}
                                value={product.quantity}
                                onChange={(e) =>
                                  updateQuantity(product.id, e.target.value)
                                }
                              />
                              <Button
                                size={"sm"}
                                onClick={() =>
                                  updateQuantity(
                                    product.id,
                                    product.quantity - 1
                                  )
                                }
                              >
                                -
                              </Button>
                            </HStack>
                          </HStack>
                        ))}
                    </Flex>
                    <Button
                      variant={"primary"}
                      rightIcon={<IoBagCheckOutline />}
                      onClick={() => router.push(`/checkout/${vendorUID}`)}
                    >
                      Checkout
                    </Button>
                  </Flex>
                </Box>
              ))
            ) : (
              <Box>Cart is empty</Box>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Cart;
