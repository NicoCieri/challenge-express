import { Console } from "console";
import fs from "fs";

export default class ProductManager {
  constructor(path) {
    this.path = path;
  }

  #areFieldsValid({ title, description, price, thumbnail, code, stock }) {
    if (typeof title !== "string" || !title) return false;
    if (typeof description !== "string" || !description) return false;
    if (typeof price !== "number") return false;
    if (typeof thumbnail !== "string" || !thumbnail) return false;
    if (typeof code !== "string" || !code) return false;
    if (typeof stock !== "number") return false;

    return true;
  }

  #isCodeUnique(code, products) {
    return !products.some((product) => product.code === code);
  }

  #generateId(products) {
    return (
      products.reduce(
        (maxId, product) => (product.id > maxId ? product.id : maxId),
        0
      ) + 1
    );
  }

  #checkIfProductExists(id, products) {
    return products.some((product) => product.id === id);
  }

  async #saveProductsToFile(products) {
    await fs.promises.writeFile(this.path, JSON.stringify(products));
  }

  async #getProductsFromFile() {
    if (fs.existsSync(this.path)) {
      const productsJSON = await fs.promises.readFile(this.path, "utf-8");

      return JSON.parse(productsJSON);
    } else return [];
  }

  async getProducts() {
    try {
      const products = await this.#getProductsFromFile();

      return products;
    } catch (error) {
      console.error("Error getting the products:" + error);
    }
  }

  async addProduct(product) {
    try {
      const products = await this.#getProductsFromFile();

      if (!this.#areFieldsValid(product)) {
        console.error("Invalid fields");
        return;
      }

      if (!this.#isCodeUnique(product.code, products)) {
        console.error("Code already exists");
        return;
      }

      const newProduct = {
        ...product,
        id: this.#generateId(products),
      };

      products.push(newProduct);

      await this.#saveProductsToFile(products);

      return newProduct;
    } catch (error) {
      console.error("Error adding the product:" + error);
    }
  }

  async getProductById(id) {
    try {
      const products = await this.#getProductsFromFile();

      const product = products.find((product) => product.id === id);

      if (product) return product;

      console.log("Not Found");
    } catch (error) {
      console.error("Error getting the product:" + error);
    }
  }

  async updateProduct(id, partialProduct) {
    try {
      const products = await this.#getProductsFromFile();
      const productToUpdate = await this.getProductById(id);

      const newProduct = {
        ...productToUpdate,
        ...partialProduct,
        id: productToUpdate.id,
      };

      if (
        partialProduct.code &&
        !this.#isCodeUnique(partialProduct.code, products)
      ) {
        console.error("Code already exists");
        return;
      }

      const newProducts = products.map((product) =>
        product.id === id ? newProduct : product
      );

      await this.#saveProductsToFile(newProducts);
    } catch (error) {
      console.error("Error updating the product:" + error);
    }
  }

  async deleteProduct(id) {
    try {
      const products = await this.#getProductsFromFile();
      const productExists = this.#checkIfProductExists(id, products);

      if (!productExists) {
        console.log("Not Found");
        return;
      }

      const filteredProducts = products.filter((product) => product.id !== id);
      await this.#saveProductsToFile(filteredProducts);
    } catch (error) {
      console.log("Error deleting the product: " + error);
    }
  }
}
