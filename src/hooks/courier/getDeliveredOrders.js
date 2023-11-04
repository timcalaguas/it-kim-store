import { firestore } from "../../../firebase-config";

const getDeliveredOrders = async () => {
  const orderResponse = await firestore.collection("orders").get();

  let orderDocs = !orderResponse.empty
    ? orderResponse.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;

        return returnDoc;
      })
    : [];

  const filteredArray = orderDocs.filter((obj) => obj.status === "delivered");

  orderDocs = filteredArray;

  return orderDocs;
};

export default getDeliveredOrders;
