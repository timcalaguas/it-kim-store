import AdminLayout from "@/components/AdminLayout";
import { firestore, storage } from "../../../../../../firebase-config";
import { FiHome, FiTrendingUp, FiCompass, FiStar } from "react-icons/fi";
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Heading,
  HStack,
  Box,
  Card,
  CardBody,
  Image,
  Flex,
  useToast,
  Textarea,
  FormHelperText,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { withSessionSsr } from "@/lib/withSession";
import getSingleProduct from "@/hooks/products/getSingleProduct";

import { FaPesoSign } from "react-icons/fa6";
import { AiFillShopping } from "react-icons/ai";
import { BsFillCartCheckFill } from "react-icons/bs";
const LinkItems = [
  { name: "Dashboard", icon: FiHome, link: "/role/vendor" },
  { name: "Products", icon: AiFillShopping, link: "/role/vendor/products" },
  { name: "Orders", icon: BsFillCartCheckFill, link: "/role/vendor/orders" },
  { name: "Sales Report", icon: FaPesoSign, link: "/role/vendor/sales-report" },
];
const EditProduct = ({ product, user }) => {
  const storageRef = storage.ref();
  const toast = useToast();
  const router = useRouter();

  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const [productImage, setProductImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  console.log(product);

  useEffect(() => {
    setValue("productName", product.productName);
    setValue("costPrice", product.costPrice);
    setValue("costDiscountedPrice", product.costDiscountedPrice);
    setValue("quantity", product.quantity);
    setValue("description", product.description);
    setProductImage(product.image);
  }, [product]);

  const selectedFile = watch("image");

  useEffect(() => {
    if (selectedFile) {
      setPreviewImage(selectedFile[0]);
    }
  }, [selectedFile]);

  async function onSubmit(values) {
    try {
      if (values.image.length > 0) {
        const productImageName = values.image[0]?.name;
        const imageRef = storageRef.child(`images/${productImageName}`);
        const file = values.image[0];

        const snapshot = await imageRef.put(file);

        const downloadURL = await imageRef.getDownloadURL();

        values.image = downloadURL;
      } else {
        values.image = productImage;
      }

      values.rating = product.rating;
      values.averageStarRating = product.averageStarRating;

      const priceWithFee = parseInt(values.costPrice) * 0.1;

      values.price = parseInt(values.costPrice) + priceWithFee;
      values.discountedPrice =
        parseInt(values.costDiscountedPrice) +
        parseInt(values.costDiscountedPrice) * 0.1;

      const response = await firestore
        .collection("products")
        .doc(router.query.id)
        .set({
          ...values,
        });

      if (!isSubmitting) {
        toast({
          title: "Product is updated.",
          description: "The product is successfully updated.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <>
      <AdminLayout
        metaTitle={"Vendor - Edit Product"}
        pageName={"IT Kim - Vendor"}
        user={user}
        LinkItems={LinkItems}
      >
        <HStack alignItems={"center"} justifyContent={"space-between"} mb={6}>
          <Heading>Edit Product</Heading>
        </HStack>
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={"end"}
                gap={"12px"}
              >
                <Box
                  display={"flex"}
                  flexDirection={"start"}
                  w={"100%"}
                  gap={"24px"}
                  flexWrap={"wrap"}
                >
                  {productImage ? (
                    <Image
                      id="preview"
                      src={
                        previewImage == null
                          ? productImage
                          : URL.createObjectURL(selectedFile[0])
                      }
                      boxSize={{ base: "100%", sm: "200px" }}
                    />
                  ) : (
                    <Image
                      id="preview"
                      src={"https://placehold.co/400x400"}
                      boxSize={{ base: "100%", sm: "200px" }}
                    />
                  )}

                  <FormControl
                    isInvalid={errors.image}
                    w={{ base: "100%", sm: "fit-content" }}
                  >
                    <FormLabel htmlFor="name">Image</FormLabel>
                    <Input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      {...register("image", {
                        validate: (value) => {
                          const types = [
                            "image/png",
                            "image/jpeg",
                            "image/jpg",
                          ];

                          console.log(value.length);
                          if (value.length > 0) {
                            if (!types.includes(value[0]?.type)) {
                              return "Invalid file format. Only JPG and PNG are allowed.";
                            }

                            if (value[0]?.size > 5242880) {
                              return "File is too large. Upload images with a size of 5MB or below.";
                            }
                          }

                          return true;
                        },
                      })}
                    />
                    <FormErrorMessage>
                      {errors.image && errors.image.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>

                <FormControl isInvalid={errors.productName}>
                  <FormLabel htmlFor="name">Product Name</FormLabel>
                  <Input
                    id="productName"
                    {...register("productName", {
                      required: "This is required",
                    })}
                  />
                  <FormErrorMessage>
                    {errors.productName && errors.productName.message}
                  </FormErrorMessage>
                </FormControl>
                <Flex w="100%" gap={"12px"}>
                  <FormControl isInvalid={errors.costPrice}>
                    <FormLabel htmlFor="price">Price</FormLabel>
                    <Input
                      type="number"
                      id="price"
                      {...register("costPrice", {
                        required: "This is required",
                      })}
                    />
                    <FormHelperText>
                      Note: A 10% platform fee will be added
                      to the product price and discounted price.
                    </FormHelperText>
                    <FormErrorMessage>
                      {errors.costPrice && errors.costPrice.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={errors.costDiscountedPrice}>
                    <FormLabel htmlFor="name">Discounted Price</FormLabel>
                    <Input
                      type="number"
                      id="discountedPrice"
                      {...register("costDiscountedPrice", {})}
                    />
                    <FormErrorMessage>
                      {errors.costDiscountedPrice &&
                        errors.costDiscountedPrice.message}
                    </FormErrorMessage>
                  </FormControl>
                </Flex>
                <FormControl isInvalid={errors.quantity}>
                  <FormLabel htmlFor="quantity">Quantity</FormLabel>
                  <Input
                    type="number"
                    id="quantity"
                    {...register("quantity", {
                      required: "This is required",
                    })}
                  />
                  <FormErrorMessage>
                    {errors.quantity && errors.quantity.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.description}>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Textarea
                    type="number"
                    id="description"
                    {...register("description", {
                      required: "This is required",
                    })}
                  />
                  <FormErrorMessage>
                    {errors.description && errors.description.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.vendorUID}>
                  <Input
                    type="hidden"
                    id="vendorUID"
                    name="vendorUID"
                    value={user.docId}
                    {...register("vendorUID", {})}
                  />
                  <FormErrorMessage>
                    {errors.vendorUID && errors.image.vendorUID}
                  </FormErrorMessage>
                </FormControl>
                <Button
                  mt={4}
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                >
                  Edit Product
                </Button>
              </Box>
            </form>
          </CardBody>
        </Card>
      </AdminLayout>
    </>
  );
};

export default EditProduct;

export const getServerSideProps = withSessionSsr(async (context) => {
  const { req } = context;
  const user = req.session.user ? req.session.user : null;

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/role/vendor/auth/login",
      },
    };
  }

  if (user.role != "vendor") {
    return {
      notFound: true,
    };
  }

  const { product } = await getSingleProduct(context.query.id);

  return {
    props: { product, user },
  };
});
