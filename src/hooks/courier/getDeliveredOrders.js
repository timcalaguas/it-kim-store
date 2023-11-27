import { firestore } from "../../../firebase-config";

const getDeliveredOrders = async (email) => {
  const orderResponse = await firestore
    .collection("orders")
    .where("courier.email", "==", email)
    .get();

  let orderDocs = !orderResponse.empty
    ? orderResponse.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;

        return returnDoc;
      })
    : [];

  console.log(orderResponse.empty);

  const filteredArray = orderDocs.filter(
    (order) => order.status == "delivered" || order.status == "received"
  );

  orderDocs = filteredArray;
  return orderDocs;
};

export default getDeliveredOrders;
