import { firestore } from "../../../firebase-config";

const getAvailableOrders = async () => {
  const orderResponse = await firestore.collection("orders").get();
  const vendorResponse = await firestore
    .collection("users")
    .where("role", "==", "vendor")
    .get();

  let orderDocs = !orderResponse.empty
    ? orderResponse.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;
        !vendorResponse.empty &&
          vendorResponse.docs.map((doc) => {
            const v = doc.data();
            v.id = doc.id;
            if (v.id === returnDoc.vendorId) {
              returnDoc.vendorAddress = v.addresses[0];
              returnDoc.vendorEmail = v.email;
              returnDoc.vendorImage = v.picture;
            }
          });
        return returnDoc;
      })
    : [];

  const filteredArray = orderDocs.filter(
    (obj) => obj.status === "order-accepted"
  );

  orderDocs = filteredArray;

  return orderDocs;
};

export default getAvailableOrders;
