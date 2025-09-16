const fs = require('fs/promises');
const path = require('path');
const config = require('../../config/config');

class ProductsDAO {
  constructor() {
    this.filePath = config.productsFile;
    this.dataPath = config.dataPath;
  }

  async init() {
    try {
      await fs.access(this.dataPath);
    } catch (error) {
      await fs.mkdir(this.dataPath, { recursive: true });
    }
  }

  async readProducts() {
    try {
      await this.init();
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeProducts(products) {
    await this.init();
    await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
  }

  async getAll() {
    return await this.readProducts();
  }

  async getById(id) {
    const products = await this.readProducts();
    return products.find(product => product.id === id);
  }

  async create(product) {
    const products = await this.readProducts();
    products.push(product);
    await this.writeProducts(products);
    return product;
  }

  async update(id, updateData) {
    const products = await this.readProducts();
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) {
      return null;
    }

    products[index] = { ...products[index], ...updateData };
    await this.writeProducts(products);
    return products[index];
  }

  async delete(id) {
    const products = await this.readProducts();
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) {
      return null;
    }

    const deletedProduct = products[index];
    products.splice(index, 1);
    await this.writeProducts(products);
    return deletedProduct;
  }

  async getByCode(code) {
    const products = await this.readProducts();
    return products.find(product => product.code === code);
  }
}

module.exports = ProductsDAO;


