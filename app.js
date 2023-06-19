import express from "express";
import ProductManager from "./ProductManager.js";

const PORT = 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productManager = new ProductManager("./products.json");

app.get("/products", async (req, res) => {
  try {
    const { limit } = req.query;

    const products = await productManager.getProducts();

    res.status(200).json({ products: products.slice(0, limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productManager.getProductById(parseInt(id));

    if (product) res.status(200).json({ product });
    else res.status(404).json({ error: "Product not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
