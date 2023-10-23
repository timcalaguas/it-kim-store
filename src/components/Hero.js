import {
  Box,
  Stack,
  Heading,
  Text,
  Image,
  Flex,
  Button,
  Link,
} from "@chakra-ui/react";

const Hero = () => {
  return (
    <>
      <Box minH={"100vh"}>
        <Box maxW={"1440px"} p={"32px"} marginInline={"auto"}>
          <Stack
            align={"center"}
            spacing={{ base: 8, md: 10 }}
            py={{ base: 20, md: 28 }}
            direction={{ base: "column", md: "row" }}
          >
            <Stack flex={1} spacing={{ base: 5, md: 10 }}>
              <Heading
                lineHeight={1.1}
                fontWeight={600}
                fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
              >
                <Text
                  as={"span"}
                  position={"relative"}
                  _after={{
                    content: "''",
                    width: "full",
                    height: "30%",
                    position: "absolute",
                    bottom: 1,
                    left: 0,
                    bg: "secondary.500",
                    zIndex: -1,
                  }}
                >
                  IT Kim
                </Text>
                <br />
                <Text as={"span"} color={"secondary.500"}>
                  Special Kapampangan Sweet Delicacy Store
                </Text>
              </Heading>
              <Text color={"gray.500"}>
                Experience the essence of Kapampangan cuisine at our Special
                Delicacy Store, where we celebrate the flavors and traditions of
                Pampanga. Discover a world of delicious pastries and savory
                delights, each dish a testament to our rich culinary heritage.
              </Text>
              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={{ base: "column", sm: "row" }}
              >
                <Button
                  rounded={"full"}
                  size={"lg"}
                  variant={"secondary"}
                  px={6}
                  as={Link}
                  href="/products/all"
                >
                  Buy Now
                </Button>
              </Stack>
            </Stack>
            <Flex
              flex={1}
              justify={"center"}
              align={"center"}
              position={"relative"}
              w={"full"}
            >
              <Box
                position={"relative"}
                aspectRatio={"1 / 1"}
                rounded={"2xl"}
                boxShadow={"2xl"}
                height={"500px"}
                bg={"white"}
                overflow={"hidden"}
              >
                <Image
                  src={"./kalamay.webp"}
                  w={"100%"}
                  height={"100%"}
                  objectFit={"cover"}
                />
              </Box>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default Hero;
