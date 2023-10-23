import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import ProductCard from "./ProductCard";

const ProductList = ({ products }) => {
  return (
    <>
      <Box paddingBlock={"32px"}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
};

export default ProductList;
