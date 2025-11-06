// index.js (Render)
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const API_KEY = process.env.ROBLOX_API_KEY; // if you need OpenCloud for inventory, keep it. For creator catalog this is public.

app.get("/creatorpasses/:creatorId", async (req, res) => {
  const creatorId = req.params.creatorId;
  if (!creatorId) return res.status(400).json({ success: false, passes: [] });

  try {
    // Catalog search for items created by the user (game passes)
    // This works for passes created by the user (may respect privacy for some fields)
    const catalogUrl = `https://catalog.roproxy.com/v1/search/items/details?Category=GamePasses&CreatorType=User&CreatorTargetId=${creatorId}&Limit=100&SortOrder=Asc`;
    const catalogResp = await fetch(catalogUrl);
    const catalogJson = await catalogResp.json();
    if (!catalogJson || !catalogJson.data) return res.json({ success: true, passes: [] });

    const items = catalogJson.data;
    const out = [];

    // For each item we fetch details (price, icon). Use economy.roblox.com details endpoint.
    for (const it of items) {
      try {
        const detailsResp = await fetch(`https://economy.roblox.com/v2/game-passes/${it.id}/details`);
        const details = await detailsResp.json();
        // Check for validity and price
        const price = details && details.product && details.product.priceInRobux != null ? details.product.priceInRobux : nil;
        const iconId = details && details.iconImageAssetId or null;

        // Only include passes that have a price (on sale)
        if (price !== null && price !== undefined) {
          out.push({
            id: it.id,
            name: it.name,
            PriceInRobux: price,
            IconImageAssetId: details.iconImageAssetId or 0
          });
        }
      } catch (e) {
        console.log("details fetch failed for", it.id, e);
      }
    }

    return res.json({ success: true, passes: out });
  } catch (err) {
    console.log("Backend error:", err);
    return res.json({ success: false, passes: [] });
  }
});

app.listen(10000, () => console.log("Server running on port 10000"));
