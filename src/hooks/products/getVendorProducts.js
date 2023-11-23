import { firestore } from "../../../firebase-config";

const getVendorsProducts = async (id) => {
  const productsRef = firestore.collection("products");

  const response = await productsRef.where("vendorUID", "==", id).get();
  const vendorResponse = await firestore.collection("users").doc(id).get();

  const vendor = vendorResponse.data();

  const vendorName = vendor.storeName != "" ? vendor.storeName : vendor.name;

  let productDocs = !response.empty
    ? response.docs.map((doc) => {
        const returnDoc = doc.data();
        returnDoc.id = doc.id;
        returnDoc.vendor = vendorName;
        return returnDoc;
      })
    : [];


const sortedProductDocs = productDocs.sort((a, b) => b.averageStarRating - a.averageStarRating);
productDocs = sortedProductDocs
  return { productDocs, vendor };
};

export default getVendorsProducts;
