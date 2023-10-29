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

  const vendorCount = vendors.size;
  const courierCount = couriers.size;

  return { vendorCount, courierCount };
};

export default getAdminDashboardCount;
