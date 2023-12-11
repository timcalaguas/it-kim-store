import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useCartStore } from "@/hooks/stores/cartStore";
import {
  Box,
  Text,
  Flex,
  HStack,
  Image,
  Button,
  Input,
  Heading,
  Select,
  FormControl,
  FormLabel,
  Stack,
  Link,
  useToast,
  VStack,
  Checkbox,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCloseButton,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { IoBagCheckOutline } from "react-icons/io5";
import { firestore } from "../../../firebase-config";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState, useRef } from "react";
import { withSessionSsr } from "@/lib/withSession";
import AuthManager from "@/hooks/auth/AuthManager";
import moment from "moment";
import { BsPatchQuestion } from "react-icons/bs";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import getOrderCount from "@/hooks/customer/getOrderCount";
import getWorkerDetails from "@/hooks/admin/getVendorDetails";

const philippineRegionsAndProvinces = [
  {
    Region: "Region I (Ilocos Region)",
    Provinces: ["Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan"],
  },
  {
    Region: "Region II (Cagayan Valley)",
    Provinces: ["Batanes", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino"],
  },
  {
    Region: "Region III (Central Luzon)",
    Provinces: [
      "Aurora",
      "Bataan",
      "Bulacan",
      "Nueva Ecija",
      "Pampanga",
      "Tarlac",
      "Zambales",
    ],
  },
  {
    Region: "Region IV-A (CALABARZON)",
    Provinces: ["Batangas", "Cavite", "Laguna", "Quezon", "Rizal"],
  },
  {
    Region: "Region IV-B (MIMAROPA)",
    Provinces: [
      "Marinduque",
      "Occidental Mindoro",
      "Oriental Mindoro",
      "Palawan",
      "Romblon",
    ],
  },
  {
    Region: "Region V (Bicol Region)",
    Provinces: [
      "Albay",
      "Camarines Norte",
      "Camarines Sur",
      "Catanduanes",
      "Masbate",
      "Sorsogon",
    ],
  },
  {
    Region: "Region VI (Western Visayas)",
    Provinces: [
      "Aklan",
      "Antique",
      "Capiz",
      "Guimaras",
      "Iloilo",
      "Negros Occidental",
    ],
  },
  {
    Region: "Region VII (Central Visayas)",
    Provinces: ["Bohol", "Cebu", "Negros Oriental", "Siquijor"],
  },
  {
    Region: "Region VIII (Eastern Visayas)",
    Provinces: [
      "Biliran",
      "Eastern Samar",
      "Leyte",
      "Northern Samar",
      "Samar",
      "Southern Leyte",
    ],
  },
  {
    Region: "Region IX (Zamboanga Peninsula)",
    Provinces: [
      "Zamboanga del Norte",
      "Zamboanga del Sur",
      "Zamboanga Sibugay",
    ],
  },
  {
    Region: "Region X (Northern Mindanao)",
    Provinces: [
      "Bukidnon",
      "Camiguin",
      "Lanao del Norte",
      "Misamis Occidental",
      "Misamis Oriental",
    ],
  },
  {
    Region: "Region XI (Davao Region)",
    Provinces: [
      "Compostela Valley",
      "Davao del Norte",
      "Davao del Sur",
      "Davao Occidental",
      "Davao Oriental",
    ],
  },
  {
    Region: "Region XII (SOCCSKSARGEN)",
    Provinces: ["Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat"],
  },
  {
    Region: "National Capital Region (NCR)",
    Provinces: [
      "City of Manila",
      "Caloocan",
      "Las Piñas",
      "Makati",
      "Malabon",
      "Mandaluyong",
      "Marikina",
      "Muntinlupa",
      "Navotas",
      "Parañaque",
      "Pasay",
      "Pasig",
      "Pateros",
      "Quezon City",
      "San Juan",
      "Taguig",
      "Valenzuela",
    ],
  },
  {
    Region: "CAR (Cordillera Administrative Region)",
    Provinces: [
      "Abra",
      "Apayao",
      "Benguet",
      "Ifugao",
      "Kalinga",
      "Mountain Province",
    ],
  },
  {
    Region: "CARAGA",
    Provinces: [
      "Agusan del Norte",
      "Agusan del Sur",
      "Dinagat Islands",
      "Surigao del Norte",
      "Surigao del Sur",
    ],
  },
  {
    Region: "ARMM (Autonomous Region in Muslim Mindanao)",
    Provinces: ["Basilan", "Lanao del Sur", "Maguindanao", "Sulu", "Tawi-Tawi"],
  },
];

export default function Checkout({ userSession, orderCount, vendor }) {
  const router = useRouter();
  const vendorUID = router.query.id;

  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelRef = useRef();

  const { loginWithGoogle } = AuthManager();

  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    userSession ? userSession.addresses[0] : {}
  );

  const { cart, removeItemsByVendorId, calculateSubtotal } = useCartStore();

  const changeAddress = (index) => {
    setSelectedAddress(userSession.addresses[index]);
  };

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const selectedCart = cart.filter((vendor) => vendor.vendorUID === vendorUID);

  const [checked, setChecked] = useState(false);

  const [shipping, setShipping] = useState(30);

  useEffect(() => {
    const baseFee = compareAddresses(
      selectedAddress,
      vendor.addresses[0].address
    );

    if (orderCount <= 10) {
      setShipping(0);
    } else if (calculateSubtotal(vendorUID) >= 400) {
      setShipping(parseInt(baseFee) - 20);
    } else if (
      calculateSubtotal(vendorUID) >= 250 &&
      calculateSubtotal(vendorUID) < 400
    ) {
      setShipping(parseInt(baseFee) - 10);
    } else {
      setShipping(parseInt(baseFee));
    }

    console.log(shipping);
  }, [cart]);

  function compareAddresses(address1, address2) {
    const region1 = findRegion(
      address1.province,
      philippineRegionsAndProvinces
    );

    const region2 = findRegion(
      address2.province,
      philippineRegionsAndProvinces
    );

    // Check if the regions are equal
    if (region1 !== region2) {
      return 150;
    }

    // Check if the provinces are equal
    if (address1.province !== address2.province) {
      return 100;
    }

    // Check if the cities are equal
    if (address1.city !== address2.city) {
      return 80;
    }

    // If all criteria are met, return 50
    return 50;
  }

  function findRegion(provinceName, regions) {
    for (const region of regions) {
      if (region.Provinces.includes(provinceName)) {
        return region.Region;
      }
    }
    return "Province not found in any region";
  }

  const checkout = async () => {
    try {
      setLoading(true);
      const selectedCart = cart.filter(
        (vendor) => vendor.vendorUID === vendorUID
      );

      const angelesOnly = ["angeles city", "angeles"];
      const city = selectedAddress.address.city.toLowerCase();

      if (
        selectedAddress.contactNumber !== "" &&
        selectedAddress.address.no &&
        selectedAddress.address.street &&
        selectedAddress.address.barangay &&
        selectedAddress.address.city
      ) {
        const orderData = {
          vendorId: selectedCart[0].vendorUID,
          vendor: selectedCart[0].vendor,
          items: selectedCart[0].items,
          customer: {
            id: userSession.docId,
            name: userSession.name,
            email: userSession.email,
            address: selectedAddress,
            picture: userSession.picture,
          },
          paymentMethod: paymentMethod,
          status: "order-placed",
          total: calculateSubtotal(vendorUID) + shipping,
          subtotal: calculateSubtotal(vendorUID),
          deliveryFee: shipping,
          date: moment(new Date()).format("MM-DD-YYYY HH:mm"),
        };

        const order = await firestore.collection("orders").add(orderData);

        if (order) {
          removeItemsByVendorId(vendorUID);
          // Success
          toast({
            title: "Checkout successful.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setLoading(false);
          router.push("/");
        }
      } else {
        setLoading(false);
        toast({
          title: "Please fill up your address correctly.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log(
    userSession == null,
    !checked,
    userSession != null && userSession.addresses.length > 0,
    (userSession == null,
    !checked,
    userSession != null && userSession.addresses.length > 0)
  );

  return (
    <>
      <Layout metaTitle={"IT Kim - Checkout"} user={userSession}>
        <Box
          w={"100%"}
          height={"100%"}
          bg={"url(/wave.svg)"}
          bgRepeat={"no-repeat"}
          bgPos={"bottom"}
        >
          <Box
            maxW={"720"}
            marginInline={"auto"}
            paddingTop={"120px"}
            minH={"100vh"}
            bg={"/wave.svg"}
          >
            <Box
              border={"1px"}
              borderColor={"gray.100"}
              padding={8}
              borderRadius={"lg"}
              boxShadow={"md"}
              bg={"white"}
            >
              <Heading mb={"20px"}>Checkout</Heading>
              {userSession != null ? (
                <>
                  <Box mb={"20px"}>
                    <Box display={"flex"} gap={"5px"}>
                      <Text fontWeight={"600"}>Name:</Text> {userSession.name}
                    </Box>
                    <Box display={"flex"} gap={"5px"}>
                      <Text fontWeight={"600"}>Email:</Text> {userSession.email}
                    </Box> 
{ userSession.addresses.length > 0 && ( <>
                    <Box display={"flex"} gap={"5px"}>
                      <Text fontWeight={"600"}>Address:</Text>{" "}
                      {selectedAddress?.address.no}{" "}
                      {selectedAddress?.address.street}
                      {", "}
                      {selectedAddress?.address.barangay}
                      {", "}
                      {selectedAddress?.address.city}
                      {", "}
                      {selectedAddress?.address.province}
                    </Box>
                    <Box display={"flex"} gap={"5px"}>
                      <Text fontWeight={"600"}>Contact Number:</Text>{" "}
                      {selectedAddress?.contactNumber != "" && "+63"}
                      {selectedAddress?.contactNumber}
                    </Box></>) }
                  </Box>

                  <Stack>
                    {userSession && userSession.addresses.length > 0 ? (
                      <FormControl mb={"16px"}>
                        <HStack
                          justifyContent={"space-between"}
                          alignItems={"end"}
                          mb={"12px"}
                        >
                          <Text fontWeight={"600"}>Select Address</Text>
                          <Button
                            variant={"primary"}
                            size={"sm"}
                            as={Link}
                            href={"/customer/profile"}
                          >
                            Add address
                          </Button>
                        </HStack>
                        <Select onChange={(e) => changeAddress(e.target.value)}>
                          {userSession.addresses.map((address, index) => (
                            <option value={index}>
                              {address.address.no} {address.address.street},
                              {address.address.barangay}, {address.address.city}
                              {", "}
                              {address.address.province} - +63
                              {address.contactNumber}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <HStack>
                        <FormControl mb={"16px"}>
                          <FormLabel>Address</FormLabel>
                          <HStack w={"100%"} justifyContent={"space-between"}>
                            <Text>No Address Found</Text>
                            <Button
                              variant={"primary"}
                              size={"sm"}
                              as={Link}
                              href={"/customer/profile"}
                            >
                              Add address
                            </Button>
                          </HStack>
                        </FormControl>
                      </HStack>
                    )}
                  </Stack>
                </>
              ) : (
                <Stack spacing={1} mb={"16px"}>
                  <Text fontWeight={"bold"}>Sign in to checkout</Text>
                  <Button
                    onClick={() => loginWithGoogle("customer")}
                    leftIcon={<FcGoogle />}
                  >
                    Sign in with Google
                  </Button>
                </Stack>
              )}

              <Box>
                <Text fontWeight={"600"}>Items</Text>
                {selectedCart.map((vendor) => {
                  return <Items items={vendor.items} />;
                })}
              </Box>
              <FormControl mb={"16px"}>
                <HStack
                  justifyContent={"space-between"}
                  alignItems={"end"}
                  mb={"12px"}
                >
                  <Text fontWeight={"600"}>Payment Method</Text>
                </HStack>
                <Select onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value={"Cash on Delivery"}>Cash on Delivery</option>
                  <option value={"GCash"}>GCash QR Code</option>
                </Select>
              </FormControl>
              <VStack textAlign={"left"} alignItems={"start"}>
                <Text>
                  <b>Note:</b> These Products are freshly baked by our Vendors.
                </Text>
              </VStack>
              <VStack textAlign={"left"} alignItems={"start"}>
                <Text>
                  Once the seller has approved your product, there's no refund
                  available for it.
                </Text>
                <Checkbox
                  onChange={(e) => setChecked(e.target.checked)}
                  value={checked}
                >
                  Check the box to agree to our No Refund Policy in our terms.
                </Checkbox>
              </VStack>
              <VStack
                fontWeight={"600"}
                alignItems={"end"}
                paddingBlock={"12px"}
              >
                <Text>Subtotal: {calculateSubtotal(vendorUID)}</Text>
                {shipping == 0 ? (
                  <HStack>
                    <Popover>
                      <PopoverTrigger>
                        <Box cursor={"pointer"}>
                          <BsPatchQuestion />
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverHeader>Delivery Fee Promo</PopoverHeader>
                        <PopoverCloseButton />
                        <PopoverBody>
                          Enjoy free delivery fee on the first 10 orders. For
                          orders between 250 and 400, delivery fee is will be
                          reduced by 10 pesos and for orders higher than 400
                          pesos it will be reduced by 20 pesos.
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    <Text>FREE DELIVERY</Text>
                  </HStack>
                ) : (
                  <HStack>
                    <Popover>
                      <PopoverTrigger>
                        <Box cursor={"pointer"}>
                          <BsPatchQuestion />
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverHeader>Delivery Fee Promo</PopoverHeader>
                        <PopoverCloseButton />
                        <PopoverBody>
                          Enjoy free delivery fee on the first 10 orders. For
                          orders between 250 and 400, delivery fee is will be
                          reduced by 10 pesos and for orders higher than 400
                          pesos it will be reduced by 20 pesos.
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    <Text>Delivery fee: {shipping}</Text>
                  </HStack>
                )}
                <Text>Total: {calculateSubtotal(vendorUID) + shipping}</Text>
              </VStack>

              <HStack justifyContent={"end"}>
                <Button
                  variant={"primary"}
                  rightIcon={<IoBagCheckOutline />}
                  isDisabled={
                    userSession == null ||
                    !checked ||
                    (userSession != null && userSession.addresses.length == 0)
                  }
                  onClick={onOpen}
                >
                  Place order
                </Button>
              </HStack>
            </Box>
          </Box>
        </Box>
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Place Order?
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to place this order? Please note that once
                you proceed, cancellations will not be possible.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  rightIcon={<IoBagCheckOutline />}
                  variant={"primary"}
                  onClick={() => checkout()}
                  ml={3}
                  isLoading={loading}
                >
                  Place Order
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Layout>
    </>
  );
}

const Items = ({ items }) => {
  const { updateQuantity, removeItemsByVendorId } = useCartStore();
  return (
    <Flex w={"100%"} flexDirection={"column"}>
      {items.length > 0 &&
        items.map((product, index) => (
          <HStack
            paddingBlock={4}
            alignItems={"center"}
            justifyContent={"space-between"}
            w={"100%"}
            flexWrap={"wrap"}
            key={product.id}
          >
            <HStack gap={4} w={{ base: "100%", sm: "40%" }}>
              <Image src={product.image} boxSize={"50px"} borderRadius={"lg"} />
              <Box
                display={{ base: "flex", sm: "block" }}
                justifyContent={"space-between"}
                w={"100%"}
                pr={{ base: "8px", sm: "0" }}
              >
                <Text fontSize={"md"} fontWeight={"medium"}>
                  {product.productName}
                </Text>
                <Text fontSize={"md"}>{product.discountedPrice}</Text>
              </Box>
            </HStack>
            <HStack w={{ base: "100%", sm: "40%" }} justifyContent={"center"}>
              <Button
                size={"sm"}
                onClick={() => updateQuantity(product.id, product.quantity + 1)}
              >
                <FaPlus />
              </Button>
              <Box w={"25px"} placeItems={"center"} display={"grid"}>
                {product.quantity}
              </Box>
              <Button
                size={"sm"}
                onClick={() => updateQuantity(product.id, product.quantity - 1)}
              >
                <FaMinus />
              </Button>
              <Button size={"sm"} onClick={() => updateQuantity(product.id, 0)}>
                <FaTrash />
              </Button>
            </HStack>
          </HStack>
        ))}
    </Flex>
  );
};

export const getServerSideProps = withSessionSsr(async (context) => {
  const { req } = context;
  const { id } = context.params;

  const userSession = req.session.user ? req.session.user : null;

  const orderCount = await getOrderCount();

  const vendor = await getWorkerDetails(id);

  return {
    props: { userSession, orderCount, vendor },
  };
});
