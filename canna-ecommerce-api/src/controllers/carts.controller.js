const CartsService = require('../services/carts.service');
const svc = new CartsService();

exports.createCart = async (req, res, next) => {
  try {
    const cart = await svc.createCart();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    next(err);
  }
};

exports.getCartById = async (req, res, next) => {
  try {
    const cart = await svc.getCartById(req.params.cid);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    next(err);
  }
};

exports.addProductToCart = async (req, res, next) => {
  try {
    const cart = await svc.addProductToCart(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    next(err);
  }
};

exports.updateProductQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await svc.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    next(err);
  }
};

exports.removeProductFromCart = async (req, res, next) => {
  try {
    const cart = await svc.removeProductFromCart(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await svc.clearCart(req.params.cid);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    next(err);
  }
};

exports.updateAllProducts = async (req, res, next) => {
  try {
    const cart = await svc.updateAllProducts(req.params.cid, req.body.products);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    next(err);
  }
};
