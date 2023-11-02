const getBodyForEmail = (type, user, email) => {
  if (type == "courier-accepted") {
    const body = {
      to: email,
      subject: `Courier ${user.name} Accepted your Email`,
      body: `Hello,
        
        We are delighted to inform you that your order has been successfully accepted by our dedicated courier team. Your package is now en route to your specified address. We kindly request your patience and cooperation as our courier ensures a safe and timely delivery.
        
        To ensure a seamless experience, we recommend that you prepare your payment for the order upon its arrival. This will help expedite the process and guarantee a smooth transaction.
        
        For any additional details regarding your order. We encourage you to visit our website. Your personal order page will provide you with more information to keep you informed throughout the delivery process.
        
        Thank you for choosing us for your Kapampangan Delicacy needs. We sincerely hope you enjoy your purchase, and we remain at your service for any further inquiries or assistance.
        
        Best regards,
        IT Kim`,
    };

    return body;
  }
};

export default getBodyForEmail;
