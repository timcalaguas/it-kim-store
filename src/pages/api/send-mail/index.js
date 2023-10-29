import sendEmail from "@/lib/email";

export default async (req, res) => {
  if (req.method === "POST") {
    const { to, subject, body } = req.body;
    try {
      const info = await sendEmail(to, subject, body);
      res.status(200).json({ message: "Email sent successfully", info });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Email sending failed", error: error.message });
    }
  } else {
    res.status(405).end();
  }
};
