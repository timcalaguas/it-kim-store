import { firestore } from "../../../firebase-config";

const getOrderCount = async () => {
  try {
    const orderResponse = await firestore.collection("orders").get();
    console.log(orderResponse.size);
    return orderResponse.size;
  } catch (error) {
    return 0;
  }
};

export default getOrderCount;
