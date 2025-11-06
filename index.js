import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// No need for API key for this creator catalog method
// (Leave environment key as-is, not used here)

app.get("/creatorpasses/:creatorId", async (req, res) => {
  const creatorId = req.params.creatorId;

  try {
    // Fetch passes created by the user (public creator catalog)
    const searchUrl = `https://catalog.roproxy.com/v1/search/items/details?Category=GamePasses&CreatorType=User&CreatorTargetId=${creatorId}&Limit=100&SortOrder=Asc`;
    const searchResp = await fetch(searchUrl);
    const searchData = await searchResp.json();

    if (!searchData || !searchData.data) {
      return res.json({ success: true, passes: [] });
    }

    const results = [];

    for (const item of searchData.data) {
      try {
        const detailResp = await fetch(`https://economy.roblox.com/v2/game-passes/${item.id}/details`);
        const details = await detailResp.json();

        if (details && details.product && details.product.priceInRobux != null) {
          results.push({
            id: item.id,
            name: item.name || "Unnamed Pass",
            PriceInRobux: details.product.priceInRobux,
            IconImageAssetId: details.iconImageAssetId || 0
          });
        }
      } catch (err) {
        console.log("Detail fetch failed:", err);
      }
    }

    return res.json({ success: true, passes: results });
  } catch (err) {
    console.log("Backend error:", err);
    return res.json({ success: false, passes: [] });
  }
});

app.listen(10000, () => console.log("✅ Tipjar backend is running"));
