import {
  Box,
  Flex,
  Image,
  Text,
  Button,
  Icon,
  Heading,
  Avatar,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverCloseButton,
  Link,
  VStack,
} from "@chakra-ui/react";
import { AiOutlineShoppingCart, AiOutlineLogin } from "react-icons/ai";
import { useCartStore } from "@/hooks/stores/cartStore";
import { useEffect, useRef } from "react";
import Cart from "./Cart";
import AuthManager from "@/hooks/auth/AuthManager";

const Navbar = ({ user }) => {
  const { logout } = AuthManager();

  const { cart } = useCartStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cartData = JSON.parse(localStorage.getItem("cart"));
      if (cartData) {
        useCartStore.setState({ cart: cartData });
      }
    }
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  let numberOfCartItems = 0;

  cart.forEach((vendor) => {
    numberOfCartItems += vendor.items.length;
  });

  return (
    <>
      <Flex
        paddingBlock={"12px"}
        position={"fixed"}
        width={"100%"}
        zIndex={"90"}
        paddingInline={"32px"}
      >
        <Flex
          align="center"
          justify="space-between"
          bg="#F5E5D5"
          p={4}
          w={"100%"}
          marginInline={"auto"}
          maxW={"1440px"}
          borderRadius={"md"}
          boxShadow={"xl"}
        >
          <Flex align="center">
            <Heading
              size={"md"}
              as={Link}
              href="/"
              _hover={{ textDecor: "none" }}
            >
              IT Kim
            </Heading>
          </Flex>

          <Flex align="center" gap={"12px"}>
            <Button
              variant={"primary"}
              size="sm"
              leftIcon={<Icon as={AiOutlineShoppingCart} />}
              ref={btnRef}
              onClick={onOpen}
            >
              Cart - {numberOfCartItems}
            </Button>
            {user ? (
              <Popover placement="bottom-end">
                <PopoverTrigger>
                  <Avatar
                    cursor={"pointer"}
                    size={"sm"}
                    name={user.name}
                    src={user.picture}
                  />
                </PopoverTrigger>
                <PopoverContent maxW={"180px"}>
                  <PopoverHeader fontWeight="semibold">
                    <Text fontWeight={"bold"} textAlign={"right"}>
                      {user.name}
                    </Text>
                  </PopoverHeader>
                  <PopoverArrow />
                  <PopoverBody>
                    <VStack alignItems={"flex-end"}>
                      <Link href="/customer/profile">Profile</Link>
                      <Link href="/customer/orders">Orders</Link>
                      <Link onClick={() => logout("customer")}>Logout</Link>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                variant={"primary"}
                size="sm"
                leftIcon={<Icon as={AiOutlineLogin} />}
                ref={btnRef}
                as={Link}
                href="/auth/login"
                _hover={{ textDecoration: "none", bgColor: "primary.500" }}
              >
                Sign in
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
      <Cart cart={cart} isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default Navbar;
