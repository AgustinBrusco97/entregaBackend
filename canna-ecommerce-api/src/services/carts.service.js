const crypto = require('crypto');
const CartsDAO = require('../dao/carts.dao');
const ProductsDAO = require('../dao/products.dao');

class CartsService {
  constructor() {
    this.cartsDAO = new CartsDAO();
    this.productsDAO = new ProductsDAO();
  }

  async createCart() {
    const cart = {
      id: crypto.randomUUID(),
      products: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.cartsDAO.create(cart);
  }

  async getCartById(id) {
    const cart = await this.cartsDAO.getById(id);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }
    return cart;
  }

  async addProductToCart(cartId, productId) {
    // Verificar que el carrito existe
    const cart = await this.cartsDAO.getById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    // Verificar que el producto existe y está activo
    const product = await this.productsDAO.getById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    if (!product.status) {
      throw new Error('No se pueden agregar productos inactivos al carrito');
    }

    // Verificar stock disponible
    const existingProductInCart = cart.products.find(p => p.product === productId);
    const currentQuantity = existingProductInCart ? existingProductInCart.quantity : 0;
    
    if (product.stock <= currentQuantity) {
      throw new Error('Stock insuficiente para agregar el producto');
    }

    // Agregar o actualizar producto en el carrito
    if (existingProductInCart) {
      existingProductInCart.quantity += 1;
    } else {
      cart.products.push({
        product: productId,
        quantity: 1
      });
    }

    cart.updatedAt = new Date().toISOString();

    return await this.cartsDAO.update(cartId, cart);
  }

  async getCartProducts(cartId) {
    const cart = await this.getCartById(cartId);
    
    // Obtener información completa de productos
    const productsWithDetails = await Promise.all(
      cart.products.map(async (cartProduct) => {
        const productDetails = await this.productsDAO.getById(cartProduct.product);
        return {
          product: productDetails,
          quantity: cartProduct.quantity
        };
      })
    );

    return {
      id: cart.id,
      products: productsWithDetails,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await this.cartsDAO.getById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    const productIndex = cart.products.findIndex(p => p.product === productId);
    if (productIndex === -1) {
      throw new Error('Producto no encontrado en el carrito');
    }

    cart.products.splice(productIndex, 1);
    cart.updatedAt = new Date().toISOString();

    return await this.cartsDAO.update(cartId, cart);
  }

  async updateProductQuantity(cartId, productId, quantity) {
    if (quantity <= 0) {
      return await this.removeProductFromCart(cartId, productId);
    }

    const cart = await this.cartsDAO.getById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    const product = await this.productsDAO.getById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    if (quantity > product.stock) {
      throw new Error('Cantidad solicitada excede el stock disponible');
    }

    const cartProduct = cart.products.find(p => p.product === productId);
    if (!cartProduct) {
      throw new Error('Producto no encontrado en el carrito');
    }

    cartProduct.quantity = quantity;
    cart.updatedAt = new Date().toISOString();

    return await this.cartsDAO.update(cartId, cart);
  }

  async clearCart(cartId) {
    const cart = await this.cartsDAO.getById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    cart.products = [];
    cart.updatedAt = new Date().toISOString();

    return await this.cartsDAO.update(cartId, cart);
  }
}

module.exports = CartsService;

