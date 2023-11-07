import { firestore } from "../../../firebase-config";

const getDeliveredOrders = async (id) => {
  const orderResponse = await firestore.collection("orders").get();

  let orderDocs = !orderResponse.empty
    ? orderResponse.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;

        return returnDoc;
      })
    : [];

  const filteredArray = orderDocs.filter(
    (order) => order.status === "delivered" && order.courier.id === id
  );

  orderDocs = filteredArray;

  return orderDocs;
};

export default getDeliveredOrders;
