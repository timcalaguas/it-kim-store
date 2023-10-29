import { Box, Image, Text, Link, VStack } from "@chakra-ui/react";

const VendorCard = ({ vendor }) => {
  return (
    <Link href={`/vendors/${vendor.id}`} _hover={{ textDecoration: "none" }}>
      <VStack
        minW={"220px"}
        minHeight={"220px"}
        bg="white"
        borderRadius={"md"}
        padding={"24px"}
      >
        <Image
          src={vendor.storeLogo}
          borderRadius={"full"}
          w={"220px"}
          border={"1px solid black"}
        />
        <Text
          mt={"12px"}
          textAlign={"center"}
          fontWeight={"bold"}
          textTransform={"uppercase"}
          fontSize={"xl"}
        >
          {vendor.storeName}
        </Text>
      </VStack>
    </Link>
  );
};

export default VendorCard;
