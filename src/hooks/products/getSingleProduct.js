import { firestore } from "../../../firebase-config";

const getSingleProduct = async (id) => {
  const productsRef = firestore.collection("products");

  const response = await productsRef.doc(id).get();

  const product = response.data();

  console.log(product);

  if (response.exists) {
    const vendor = await firestore
      .collection("users")
      .doc(product.vendorUID)
      .get();

    if (vendor.exists) {
      product.vendor = vendor.data().storeName || vendor.data().name;
    }

    const moreProducts = await productsRef
      .where("vendorUID", "==", product.vendorUID)
      .limit(3)
      .get();

    const products = !moreProducts.empty
      ? moreProducts.docs
          .map((doc) => {
            const returnDoc = doc.data();
            returnDoc.id = doc.id;
            returnDoc.vendor = vendor.data().storeName || vendor.data().name;
            return returnDoc;
          })
          .filter((product) => product.id != id)
      : [];

    return { products, product };
  } else {
    const products = [];
    const product = {};

    return { products, product };
  }
};

export default getSingleProduct;
