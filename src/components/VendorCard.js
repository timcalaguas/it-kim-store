import { Box, Image, Text, Link } from "@chakra-ui/react";

const VendorCard = ({ vendor }) => {
  console.log(vendor.picture);
  return (
    <Link href={`/vendors/${vendor.id}`} _hover={{ textDecoration: "none" }}>
      <Box
        minW={"220px"}
        minHeight={"220px"}
        bg="white"
        borderRadius={"md"}
        padding={"24px"}
      >
        <Image
          src={vendor.picture}
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
          {vendor.name}
        </Text>
      </Box>
    </Link>
  );
};

export default VendorCard;
