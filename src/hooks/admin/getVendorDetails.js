import { firestore } from "../../../firebase-config";

const getWorkerDetails = async (id) => {
  const vendor = await firestore.collection("users").doc(id).get();

  const vendorData = vendor.data();

  const vendorRatings = await firestore
    .collection("ratings")
    .where("userEmail", "==", vendorData.email)
    .get();

  const vendorRatingDocs = !vendorRatings.empty
    ? vendorRatings.docs.map((rating) => {
        return rating.data();
      })
    : [];

  vendorData.ratings = vendorRatingDocs;
  vendorData.id = id;
  return vendorData;
};

export default getWorkerDetails;
