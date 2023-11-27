import { firestore } from "../../../firebase-config";

const getAdminDashboardCount = async () => {
  const vendors = await firestore
    .collection("users")
    .where("role", "==", "vendor")
    .get();

  const couriers = await firestore
    .collection("users")
    .where("role", "==", "courier")
    .get();

  const customer = await firestore
    .collection("users")
    .where("role", "==", "customer")
    .get();

  const order = await firestore.collection("orders").get();
  const filteredArray = order.docs.filter(
    (order) =>
      order.data().status == "delivered" || order.data().status == "received"
  );

  const vendorCount = vendors.size;
  const courierCount = couriers.size;
  const customerCount = customer.size;
  const orderCount = filteredArray.length;

  return { vendorCount, courierCount, customerCount, orderCount };
};

export default getAdminDashboardCount;
