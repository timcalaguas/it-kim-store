import { Box, Icon, useColorModeValue } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { useMemo } from "react";

const StarRatingInput = ({ rating, onRatingChange }) => {
  const starColor = useColorModeValue("yellow.500", "yellow.200");

  const handleRatingChange = (newRating) => {
    onRatingChange(newRating);
  };

  return useMemo(
    () => (
      <Box display="flex">
        {[1, 2, 3, 4, 5].map((index) => (
          <Icon
            key={index}
            as={FaStar}
            w={6}
            h={6}
            color={index <= rating ? starColor : "gray.200"}
            cursor="pointer"
            onClick={() => handleRatingChange(index)}
            css={{ outline: "none" }} // Disable focus outline
          />
        ))}
      </Box>
    ),
    [rating]
  );
};

export default StarRatingInput;
