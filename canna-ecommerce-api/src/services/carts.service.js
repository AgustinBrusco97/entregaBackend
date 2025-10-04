const { CartModel } = require('../dao/models/cart.model');
const { ProductModel } = require('../dao/models/product.model');

class CartsService {
  async createCart() {
    const cart = await CartModel.create({ products: [] });
    return cart.toObject();
  }

  async getCartById(id) {
    const cart = await CartModel.findById(id).populate('products.product').lean();
    if (!cart) throw new Error('Carrito no encontrado');
    return cart;
  }

  async addProductToCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const product = await ProductModel.findById(productId);
    if (!product) throw new Error('Producto no encontrado');
    if (!product.status) throw new Error('Producto inactivo');
    if (product.stock <= 0) throw new Error('Stock insuficiente');

    const existing = cart.products.find(p => p.product.equals(productId));
    if (existing) {
      existing.quantity++;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    return await cart.populate('products.product');
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const product = await ProductModel.findById(productId);
    if (!product) throw new Error('Producto no encontrado');
    if (quantity > product.stock) throw new Error('Cantidad excede stock disponible');

    const item = cart.products.find(p => p.product.equals(productId));
    if (!item) throw new Error('Producto no encontrado en carrito');

    item.quantity = quantity;
    await cart.save();
    return await cart.populate('products.product');
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = cart.products.filter(p => !p.product.equals(productId));
    await cart.save();
    return await cart.populate('products.product');
  }

  async clearCart(cartId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = [];
    await cart.save();
    return cart.toObject();
  }

  async updateAllProducts(cartId, products) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = products.map(p => ({
      product: p.product,
      quantity: p.quantity
    }));

    await cart.save();
    return await cart.populate('products.product');
  }
}

module.exports = CartsService;
