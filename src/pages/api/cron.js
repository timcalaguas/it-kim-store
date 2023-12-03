export default function handler(request, response) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).end("Unauthorized");
  }
  console.log("123");
  console.log("Checking Vercel Cron");
  return response.json({ success: true });
}
