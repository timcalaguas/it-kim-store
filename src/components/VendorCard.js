import { Box, Image, Text, VStack, Avatar } from "@chakra-ui/react";
import Link from "next/link";

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
        <Avatar
          name={vendor.storeName != "" ? vendor.storeName : vendor.name}
          src={vendor.storeLogo}
          borderRadius={"full"}
          boxSize={"220px"}
          border={"1px solid black"}
        />
        <Text
          mt={"12px"}
          textAlign={"center"}
          fontWeight={"bold"}
          textTransform={"uppercase"}
          fontSize={"xl"}
        >
          {vendor.storeName != "" ? vendor.storeName : vendor.name}
        </Text>
      </VStack>
    </Link>
  );
};

export default VendorCard;
