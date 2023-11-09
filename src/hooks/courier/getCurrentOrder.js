import { firestore } from "../../../firebase-config";

const getCurrentOrder = async (id) => {
  const orderResponse = await firestore.collection("orders").doc(id).get();

  const orderDoc = orderResponse.data();
  orderDoc.id = orderResponse.id;

  const vendorResponse = await firestore
    .collection("users")
    .doc(orderDoc.vendorId)
    .get();
  const vendorDoc = vendorResponse.data();

  orderDoc.vendorAddress = vendorDoc.addresses[0];
  orderDoc.vendorEmail = vendorDoc.email;
  orderDoc.vendorImage = vendorDoc.picture;

  return orderDoc;
};

export default getCurrentOrder;
