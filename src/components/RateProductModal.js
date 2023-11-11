import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import { firestore } from "../../firebase-config";

const RateProductModal = (user) => {
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState();

  const [starRating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [orderId, setOrderId] = useState();

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const openRatingModal = (item, orderId) => {
    setModalOpen(true);
    setRating(0);
    setSelectedProduct(item);
    setOrderId(orderId);
  };

  const rateProduct = async () => {
    try {
      setLoading(true);
      const newRating = {
        stars: starRating,
        comment: comment,
        user: {
          name: user.name,
          email: user.email,
        },
      };

      const product = await firestore
        .collection("products")
        .doc(selectedProduct.id)
        .get();

      if (product.exists) {
        const { rating } = product.data();

        rating.push(newRating);

        const totalStarRating = rating.reduce(
          (sum, review) => sum + review.stars,
          0
        );
        const newAverageStarRating = totalStarRating / rating.length;

        const response = await firestore
          .collection("products")
          .doc(selectedProduct.id)
          .update({
            averageStarRating: newAverageStarRating,
            rating: rating,
          });

        const orderResponse = await firestore
          .collection("orders")
          .doc(orderId)
          .get();

        if (orderResponse.exists) {
          const order = orderResponse.data();
          const items = order.items;
          const foundObjectIndex = items.findIndex(
            (obj) => obj.id == selectedProduct.id
          );
          const updatedObject = { ...items[foundObjectIndex], rated: true };
          items[foundObjectIndex] = updatedObject;

          const response = await firestore
            .collection("orders")
            .doc(orderId)
            .update({
              items: items,
            });

          toast({
            title: "Rating submitted.",
            description: "We've added your rating for this product.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setModalOpen(false);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    modalOpen,
    setModalOpen,
    loading,
    handleRatingChange,
    openRatingModal,
    setSelectedProduct,
    rateProduct,
    selectedProduct,
    starRating,
    comment,
    setComment,
  };
};

export default RateProductModal;
