import { firestore } from "../../../firebase-config";

const getCourierDashboardCount = async () => {
  const availableOrders = await firestore
    .collection("orders")
    .where("status", "==", "order-accepted")
    .get();

  const finishedOrders = await firestore
    .collection("orders")
    .where("status", "==", "delivered")
    .get();

  const availableOrderCount = availableOrders.size;
  const finishedOrderCount = finishedOrders.size;

  return { availableOrderCount, finishedOrderCount };
};

export default getCourierDashboardCount;
