import { firestore } from "../../../firebase-config";

const getVendorOrders = async (id) => {
  const orderDocs = await firestore
    .collection("orders")
    .where("vendorId", "==", id)
    .get();

  let orders = !orderDocs.empty
    ? orderDocs.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;

        return returnDoc;
      })
    : [];

  return orders;
};

export default getVendorOrders;
