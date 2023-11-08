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

  const vendorCount = vendors.size;
  const courierCount = couriers.size;
  const customerCount = customer.size;

  return { vendorCount, courierCount, customerCount };
};

export default getAdminDashboardCount;
