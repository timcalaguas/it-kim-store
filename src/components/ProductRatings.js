import {
  Avatar,
  Box,
  Container,
  HStack,
  Heading,
  VStack,
  Text,
} from "@chakra-ui/react";
import StarRating from "./StarRating";

const ProductRatings = ({ ratings }) => {
  return (
    <Container maxW={"7xl"}>
      <Heading mb="24px">Product Ratings</Heading>
      <VStack alignItems={"start"} w={"100%"}>
        {ratings.map((rating, index) => (
          <Box
            padding={"16px"}
            border={"1px"}
            borderColor={"gray.200"}
            w={"100%"}
            display={"flex"}
            flexDir={"column"}
            gap={"12px"}
            key={index}
          >
            <HStack>
              <Avatar boxSize={"50px"} src={rating.user.image} />
              <Box>
                <Text>{rating.user.name}</Text>
                <Text>{rating.user.email}</Text>
              </Box>
            </HStack>
            <Box>
              <HStack>
                <Text>Rating:</Text> <StarRating rating={rating.stars} />
              </HStack>
              <HStack>
                <Text>Comment:</Text>

                <Text>{rating.comment}</Text>
              </HStack>
            </Box>
          </Box>
        ))}
      </VStack>
    </Container>
  );
};

export default ProductRatings;
