import express from "express";
import pkg from "contentstack";

const Contentstack = pkg;
const app = express();
const PORT = 3001;


app.get("/entries", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const deliveryToken = req.headers["x-delivery-token"];
    const contentTypeUid = req.query.content_type;
    if (!apiKey || !deliveryToken) {
      return res.status(400).json({ error: "Missing API key or delivery token" });
    }

    const Stack = Contentstack.Stack({
      api_key: apiKey,
      delivery_token: deliveryToken,
      environment: "prod",  // add your environment
      region: Contentstack.Region.EU,  // specify region 
    });

    const contentType = await Stack.ContentType(contentTypeUid).fetch();
    const referenceFields = contentType.content_type.schema
      .filter(f => f.data_type === "reference")
      .map(f => f.uid);

      console.log("Reference Fields:", referenceFields);

    const query = Stack.ContentType(contentTypeUid).Query();

    query
      .includeReference(referenceFields)
      .toJSON()
      .find()
      .then(([entries]) => {
        res.json(entries);
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Search with references included
app.get("/search", async (req, res) => {
  const { q } = req.query;
  try {
    const apiKey = req.headers["x-api-key"];
    const deliveryToken = req.headers["x-delivery-token"];
    const contentTypeUid = req.query.content_type;
    if (!apiKey || !deliveryToken) {
      return res.status(400).json({ error: "Missing API key or delivery token" });
    }
    const Stack = Contentstack.Stack({
      api_key: apiKey,
      delivery_token: deliveryToken,
      environment: "prod",
      region: Contentstack.Region.EU,
    });
    const contentType = await Stack.ContentType(contentTypeUid).fetch();
    const referenceFields = contentType.content_type.schema
      .filter(f => f.data_type === "reference")
      .map(f => f.uid);

    const query = Stack.ContentType(contentTypeUid).Query();
    query
      .where("title", "like", q)
      .includeReference(referenceFields)
      .limit(3)
      .toJSON()
      .find()
      .then(([entries]) => {
        res.json(entries);
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => {
  console.log(`MCP Server running on http://localhost:${PORT}`);
});
