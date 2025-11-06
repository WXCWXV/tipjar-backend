import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const API_KEY = process.env.ROBLOX_API_KEY;

app.get("/passes/:userId", async (req, res) => {
  const userId = req.params.userId;
  if (!userId) return res.status(400).json({ success: false, passes: [] });

  try {
    const response = await fetch(
      `https://apis.roblox.com/inventory/v1/users/${userId}/items/GamePass?limit=100`,
      { headers: { "x-api-key": API_KEY } }
    );

    const data = await response.json();
    if (!data || !data.data) return res.json({ success: true, passes: [] });

    // Get detailed data for each pass
    const detailedPasses = [];

    for (const item of data.data) {
      const infoResponse = await fetch(
        `https://economy.roblox.com/v2/game-passes/${item.id}/details`
      );
      const info = await infoResponse.json();

      if (info && info.product && info.product.priceInRobux !== null) {
        detailedPasses.push({
          id: item.id,
          name: item.name,
          PriceInRobux: info.product.priceInRobux,
          IconImageAssetId: info.iconImageAssetId
        });
      }
    }

    res.json({ success: true, passes: detailedPasses });
  } catch (err) {
    console.log("Backend Error:", err);
    res.json({ success: false, passes: [] });
  }
});

app.listen(10000, () => console.log("Server running on 10000"));
