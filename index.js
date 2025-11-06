import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// API key will be set in Render Environment Variables
const API_KEY = process.env.ROBLOX_API_KEY;

app.get("/passes/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const response = await fetch(
      `https://apis.roblox.com/inventory/v1/users/${userId}/items/GamePass?limit=100`,
      { headers: { "x-api-key": API_KEY } }
    );

    const data = await response.json();
    if (!data || !data.data) return res.json({ success: false, passes: [] });

    const formatted = data.data.map(item => ({
      id: item.id,
      name: item.name
    }));

    res.json({ success: true, passes: formatted });
  } catch (err) {
    console.log("Backend Error:", err);
    res.json({ success: false, passes: [] });
  }
});

app.listen(10000, () => console.log("Server running"));
