const ProductsService = require('../services/products.service');
const svc = new ProductsService();

function pickMethod(obj, candidates) {
  for (const name of candidates) if (typeof obj[name] === 'function') return name;
  throw new Error(`Método no encontrado. Probé: ${candidates.join(', ')}`);
}

exports.getAll = async (req, res, next) => {
  try {
    const method = pickMethod(svc, ['getAll', 'getAllProducts', 'findAll', 'list']);
    const products = await svc[method](req.query);
    res.json({ status: 'success', data: products });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const method = pickMethod(svc, ['getById', 'getProductById', 'findById']);
    const product = await svc[method](req.params.pid);
    res.json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const method = pickMethod(svc, ['createProduct', 'create', 'add']);
    const product = await svc[method](req.body);
    const io = req.app.get('io');
    io.emit('products:changed');
    res.status(201).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const method = pickMethod(svc, ['updateProduct', 'update']);
    const updated = await svc[method](req.params.pid, req.body);
    const io = req.app.get('io');
    io.emit('products:changed');
    res.json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const method = pickMethod(svc, ['deleteProduct', 'delete', 'remove', 'deleteById']);
    await svc[method](req.params.pid);
    const io = req.app.get('io');
    io.emit('products:changed');
    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (err) {
    next(err);
  }
};
