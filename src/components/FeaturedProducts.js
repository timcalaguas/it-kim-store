import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({ products, fromVendor }) => {
  return (
    <Box
      p={8}
      backgroundImage={`url('/wave.svg')`}
      backgroundRepeat={"no-repeat"}
      backgroundPosition={"bottom"}
    >
      <Box
        textAlign={"center"}
        display={"grid"}
        placeItems={"center"}
        maxWidth={"1440px"}
        marginInline={"auto"}
        paddingBlock={"40px"}
      >
        <Heading fontSize="3xl" mb={"32px"}>
          {fromVendor == ""
            ? "Featured Products"
            : `More products from ${fromVendor}`}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default FeaturedProducts;
