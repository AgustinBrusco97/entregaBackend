const CartsService = require('../services/carts.service');

class CartsController {
  constructor() {
    this.cartsService = new CartsService();
  }

  async createCart(req, res, next) {
    try {
      const cart = await this.cartsService.createCart();
      res.status(201).json({
        status: 'success',
        payload: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async getCartById(req, res, next) {
    try {
      const { cid } = req.params;
      const cart = await this.cartsService.getCartProducts(cid);
      res.json({
        status: 'success',
        payload: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async addProductToCart(req, res, next) {
    try {
      const { cid, pid } = req.params;
      const cart = await this.cartsService.addProductToCart(cid, pid);
      res.json({
        status: 'success',
        message: 'Producto agregado al carrito',
        payload: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async removeProductFromCart(req, res, next) {
    try {
      const { cid, pid } = req.params;
      const cart = await this.cartsService.removeProductFromCart(cid, pid);
      res.json({
        status: 'success',
        message: 'Producto eliminado del carrito',
        payload: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProductQuantity(req, res, next) {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cantidad debe ser un número mayor o igual a 0'
        });
      }

      const cart = await this.cartsService.updateProductQuantity(cid, pid, quantity);
      res.json({
        status: 'success',
        message: 'Cantidad actualizada',
        payload: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const { cid } = req.params;
      const cart = await this.cartsService.clearCart(cid);
      res.json({
        status: 'success',
        message: 'Carrito vaciado',
        payload: cart
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CartsController;

