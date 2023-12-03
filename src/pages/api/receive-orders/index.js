export default function handler(request, response) {
  console.log("123");
  console.log("Checking Vercel Cron");
  return response.json({ success: true });
}
