import { firestore } from "../../../firebase-config";

const getCurrentOrder = async (id) => {
  const orderResponse = await firestore.collection("orders").doc(id).get();

  const orderDoc = orderResponse.data();
  orderDoc.id = orderResponse.id;

  return orderDoc;
};

export default getCurrentOrder;
