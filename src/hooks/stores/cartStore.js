import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cart: [],

  calculateSubtotal: (vendorUID) => {
    const vendor = get().cart.find((vendor) => vendor.vendorUID === vendorUID);
    if (!vendor) return 0;

    const subtotal = vendor.items.reduce((acc, item) => {
      const price =
        item.discountedPrice != ""
          ? parseInt(item.discountedPrice)
          : parseInt(item.price);
      return acc + price * item.quantity;
    }, 0);

    return subtotal;
  },

  addToCart: (product) => {
    set((state) => {
      const existingVendor = state.cart.find(
        (vendor) => vendor.vendorUID === product.vendorUID
      );

      if (existingVendor) {
        // Check if the product with the same ID exists in the current vendor's items
        const existingItem = existingVendor.items.find(
          (item) => item.id === product.id
        );

        if (existingItem) {
          // If the same product exists in the current vendor's items, increment its quantity
          const updatedCart = state.cart.map((vendor) =>
            vendor.vendorUID === product.vendorUID
              ? {
                  ...vendor,
                  items: vendor.items.map((item) =>
                    item.id === product.id
                      ? { ...item, quantity: item.quantity + 1 }
                      : item
                  ),
                }
              : vendor
          );

          // Update localStorage with the new cart state and vendor totals
          localStorage.setItem("cart", JSON.stringify(updatedCart));
          return { cart: updatedCart };
        } else {
          // If a product with the same vendor exists but not the same ID, add a new item
          const updatedCart = state.cart.map((vendor) =>
            vendor.vendorUID === product.vendorUID
              ? {
                  ...vendor,
                  items: [...vendor.items, { ...product, quantity: 1 }],
                }
              : vendor
          );

          localStorage.setItem("cart", JSON.stringify(updatedCart));
          return { cart: updatedCart };
        }
      } else {
        // Check if the product is already in the cart
        const existingProduct = state.cart.some((vendor) =>
          vendor.items.some((item) => item.id === product.id)
        );

        if (existingProduct) {
          return state; // Return the current state without making changes
        }

        const updatedCart = [
          ...state.cart,
          {
            vendorUID: product.vendorUID,
            vendor: product.vendor,
            items: [{ ...product, quantity: 1 }],
          },
        ];

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        return { cart: updatedCart };
      }
    });
  },

  removeFromCart: (productId) => {
    set((state) => {
      const updatedCart = state.cart.map((vendor) => ({
        ...vendor,
        items: vendor.items.filter((item) => item.id !== productId),
      }));

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });
  },

  clearCart: () => {
    set(() => {
      localStorage.removeItem("cart");

      return { cart: [] };
    });
  },

  removeItemsByVendorId: (vendorId) => {
    set((state) => {
      const updatedCart = state.cart.filter(
        (vendor) => vendor.vendorUID !== vendorId
      );

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });
  },

  updateQuantity: (productId, newQuantity) => {
    set((state) => {
      const updatedCart = state.cart
        .map((vendor) => ({
          ...vendor,
          items: vendor.items
            .map((item) =>
              item.id === productId
                ? newQuantity === 0
                  ? null
                  : { ...item, quantity: newQuantity }
                : item
            )
            .filter((item) => item !== null),
        }))
        .filter((vendor) => vendor.items.length > 0);

      // Update localStorage with the new cart state
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return {
        cart: updatedCart,
      };
    });
  },
}));
