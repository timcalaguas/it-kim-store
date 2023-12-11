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
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { AiOutlineShoppingCart, AiOutlineLogin } from "react-icons/ai";
import { useCartStore } from "@/hooks/stores/cartStore";
import { useEffect, useRef } from "react";
import Cart from "./Cart";
import AuthManager from "@/hooks/auth/AuthManager";
import { HiBellAlert } from "react-icons/hi2";
import Notifications from "./Notifcations";

const Navbar = ({ user }) => {
  const { logout } = AuthManager();

  const { cart } = useCartStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cartData = JSON.parse(localStorage.getItem("cart"));
      const total = JSON.parse(localStorage.getItem("total"));
      const subtotal = JSON.parse(localStorage.getItem("subtotal"));
      if (cartData) {
        useCartStore.setState({ cart: cartData });
        useCartStore.setState({ total: total });
        useCartStore.setState({ subtotal: subtotal });
      }
    }
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  const {
    isOpen: notifIsOpen,
    onOpen: notifOnOpen,
    onClose: notifOnClose,
  } = useDisclosure();
  const notifBtnRef = useRef();

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

{ user && (            <Box
              p={"4px"}
              borderRadius={"50%"}
              border={"1px solid #86673e"}
              cursor={"pointer"}
              ref={notifBtnRef}
              onClick={notifOnOpen}
            > )}
              <HiBellAlert color="#86673e" fontSize={"20px"} />
            </Box>

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
                      <Box
                        onClick={() => logout("customer")}
                        cursor={"pointer"}
                      >
                        Logout
                      </Box>
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
{ user && (
      <Notifications
        userId={user.docId}
        isOpen={notifIsOpen}
        onClose={notifOnClose}
      /> )}
    </>
  );
};

export default Navbar;
