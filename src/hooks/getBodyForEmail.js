const getBodyForEmail = (type, customer, user, order = null) => {
  if (type == "courier-accepted") {
    const body = {
      to: customer.email,
      subject: `Courier '${user.name}' will deliver your Order`,
      body: `Hello ${customer.name},
        
        We are delighted to inform you that your order has been successfully accepted by our dedicated courier team. Your food is now en route to your specified address. We kindly request your patience and cooperation as our courier ensures a safe and timely delivery.
        
        To ensure a seamless experience, we recommend that you prepare your payment for the order upon its arrival. This will help expedite the process and guarantee a smooth transaction.
        
        For any additional details regarding your order. We encourage you to visit our website. Your personal order page will provide you with more information to keep you informed throughout the delivery process.
        
        Thank you for choosing us for your Kapampangan Delicacy needs. We sincerely hope you enjoy your purchase, and we remain at your service for any further inquiries or assistance.
        
        Best regards,
        IT Kim`,
    };

    return body;
  } else if (type == "order-accepted") {
    const body = {
      to: customer.email,
      subject: `Vendor '${
        user.storeName != "" ? user.storeName : user.name
      }' accepted your Order`,
      body: `Hello ${customer.name},
        
        We're thrilled to let you know that your order is currently in progress. Our vendor has accepted it, and preparations are underway. The next step is to send it out for delivery to your address.

        We'll keep you updated on the progress, and you can monitor the order details on our website. If you have any questions, feel free to reach out to the vendor's email ${user.email} or contact number ${user.addresses[0].contactNumber}.
        
        Thank you for choosing our services.

        Best regards,
        IT Kim`,
    };

    return body;
  } else if (type == "order-declined") {
    const body = {
      to: customer.email,
      subject: `Vendor ${user.name} accepted your Order`,
      body: `Hello ${customer.name},
        
        We regret to inform you that your recent order has been declined by our vendor. The reason for this decision is due to concerns that the order might be a potential bogus or fraudulent transaction.
        
        We understand the importance of your order and would like to assist you in finding an alternative solution. Please feel free to reach out to our vendor's email: ${user.email} or contact number ${user.addresses[0].contactNumber}. We can help you explore other product options, address any concerns, or provide further assistance to ensure a better experience in the future.
        
        Once again, we apologize for any inconvenience this may have caused. We appreciate your understanding and look forward to serving you better in the future.

        Best regards,
        IT Kim`,
    };

    return body;
  } else if (type == "received") {
    const body = {
      to: user.email,
      subject: `Order #${order} is received by the customer`,
      body: `Hello ${user.name},
        
      We hope this message finds you well. We are pleased to inform you that the customer has successfully received their order.

      Thank you for your prompt service!

      Best regards,
      IT Kim`,
    };

    return body;
  }
};

export default getBodyForEmail;
