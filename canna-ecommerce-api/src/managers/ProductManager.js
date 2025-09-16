const ProductsService = require('../services/products.service');

class ProductManager {
  constructor() {
    this.svc = new ProductsService();
  }
  async getProducts(query) {
    const out = await this.svc.getAll?.(query) ?? await this.svc.getAllProducts?.(query);
    return out;
  }
  async addProduct(payload) {
    return this.svc.createProduct(payload);
  }
  async deleteProduct(id) {
    return this.svc.deleteProduct(id);
  }
}

module.exports = ProductManager;
