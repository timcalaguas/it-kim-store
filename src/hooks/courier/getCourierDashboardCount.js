import { firestore } from "../../../firebase-config";

const getCourierDashboardCount = async (email) => {
  const availableOrders = await firestore
    .collection("orders")
    .where("status", "==", "order-accepted")
    .get();

  const finishedOrders = await firestore
    .collection("orders")
    .where("courier.email", "==", email)
    .get();

  const completedOrders = finishedOrders.docs.map((obj) => {
    const returnDoc = obj.data();
    if (returnDoc.status == "delivered" || returnDoc.status == "received") {
      return returnDoc;
    }
  });

  const availableOrderCount = availableOrders.size;
  const finishedOrderCount = completedOrders.length;

  return { availableOrderCount, finishedOrderCount };
};

export default getCourierDashboardCount;
