const fs = require('fs/promises');
const path = require('path');
const config = require('../../config/config');

class CartsDAO {
  constructor() {
    this.filePath = config.cartsFile;
    this.dataPath = config.dataPath;
  }

  async init() {
    try {
      await fs.access(this.dataPath);
    } catch (error) {
      await fs.mkdir(this.dataPath, { recursive: true });
    }
  }

  async readCarts() {
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

  async writeCarts(carts) {
    await this.init();
    await fs.writeFile(this.filePath, JSON.stringify(carts, null, 2));
  }

  async getAll() {
    return await this.readCarts();
  }

  async getById(id) {
    const carts = await this.readCarts();
    return carts.find(cart => cart.id === id);
  }

  async create(cart) {
    const carts = await this.readCarts();
    carts.push(cart);
    await this.writeCarts(carts);
    return cart;
  }

  async update(id, updateData) {
    const carts = await this.readCarts();
    const index = carts.findIndex(cart => cart.id === id);
    
    if (index === -1) {
      return null;
    }

    carts[index] = { ...carts[index], ...updateData };
    await this.writeCarts(carts);
    return carts[index];
  }

  async delete(id) {
    const carts = await this.readCarts();
    const index = carts.findIndex(cart => cart.id === id);
    
    if (index === -1) {
      return null;
    }

    const deletedCart = carts[index];
    carts.splice(index, 1);
    await this.writeCarts(carts);
    return deletedCart;
  }
}

module.exports = CartsDAO;
