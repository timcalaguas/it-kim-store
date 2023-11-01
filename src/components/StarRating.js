import { Box, Icon } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";

const StarRating = ({ rating }) => {
  const roundedRating = Math.floor(rating);
  const numGoldStars = roundedRating > 0 ? Math.min(5, roundedRating) : 0;
  const numGrayStars = 5 - numGoldStars;

  return (
    <Box display="flex">
      {[...Array(numGoldStars)].map((_, index) => (
        <Icon key={index} as={FaStar} color="gold" boxSize={5} />
      ))}
      {[...Array(numGrayStars)].map((_, index) => (
        <Icon key={index} as={FaStar} color="gray.300" boxSize={5} />
      ))}
    </Box>
  );
};

export default StarRating;
