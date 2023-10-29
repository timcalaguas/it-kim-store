import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Heading,
  Card,
  CardBody,
  CardHeader,
  Image,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import Head from "next/head";
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
} from "react-icons/fi";
import { useRouter } from "next/router";
import AuthManager from "@/hooks/auth/AuthManager";
import Link from "next/link";

const SidebarContent = ({ onClose, title, LinkItems, ...rest }) => {
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="lg" fontFamily="monospace" fontWeight="bold">
          {title}
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} link={link.link} mb={2}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

const NavItem = ({ icon, children, link, ...rest }) => {
  const pathName = useRouter().pathname;
  var words = pathName.split("/");

  words.splice(4, 3);

  var mergedString = words.join("/");

  return (
    <Box
      as={Link}
      href={link}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: "#3082CF",
          color: "white",
        }}
        bg={mergedString == link ? "#3082CF" : "transparent"}
        color={mergedString == link ? "white" : "black"}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: "white",
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};

const MobileNav = ({ onOpen, title, user, ...rest }) => {
  const { logout } = AuthManager();
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: "flex", md: "none" }}
        fontSize="xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {title}
      </Text>

      <HStack spacing={{ base: "0", md: "6" }}>
        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <HStack>
                <Avatar size={"sm"} src={user.picture} />
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{user.name}</Text>
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <MenuItem onClick={() => logout(user.role)}>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};

const AdminLayout = ({ metaTitle, pageName, user, LinkItems, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const router = useRouter();

  const pathName = router.pathname;

  var words = pathName.split("/");

  if (words[0] === "") {
    words.shift();
  }

  if (words.length > 3) {
    words.splice(4, 1);
  }

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content="IT Kim - Kapampangan Sweet Shop" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {true && (
        <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
          <SidebarContent
            onClose={() => onClose}
            display={{ base: "none", md: "block" }}
            title={pageName}
            LinkItems={LinkItems}
          />
          <Drawer
            isOpen={isOpen}
            placement="left"
            onClose={onClose}
            returnFocusOnClose={false}
            onOverlayClick={onClose}
            size="full"
          >
            <DrawerContent>
              <SidebarContent
                onClose={onClose}
                title={pageName}
                LinkItems={LinkItems}
              />
            </DrawerContent>
          </Drawer>
          <MobileNav onOpen={onOpen} title={pageName} user={user} />
          <Box ml={{ base: 0, md: 60 }} p={{ base: 8, md: 10 }}>
            <Breadcrumb mb={"50px"}>
              {words.map((word, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink
                    href={
                      index == 0
                        ? `/${word}`
                        : index == 1
                        ? `/${words[index - 1]}/${word}`
                        : `/${words[index - 2]}/${words[index - 1]}/${word}`
                    }
                    textTransform={"capitalize"}
                  >
                    {word}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
            <Box>{children}</Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default AdminLayout;
