// src/services/products.service.js
const path = require('path');
const { ProductModel } = require('../dao/models/product.model'); // ruta correcta

class ProductsService {
  async getAllProducts({ limit = 10, page = 1, sort, query }) {
    // defensivo por si el require falló
    if (!ProductModel) {
      throw new Error('ProductModel no está definido. Verifica export/import del modelo.');
    }

    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;

    const filter = {};
    if (query) {
      const [key, val] = String(query).split(':');
      if (key && val) {
        if (key === 'category') filter.category = val;
        else if (key === 'status') filter.status = val === 'true';
        else filter.title = { $regex: query, $options: 'i' };
      } else {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ];
      }
    }

    const sortOpt = {};
    if (sort === 'asc') sortOpt.price = 1;
    if (sort === 'desc') sortOpt.price = -1;

    const skip = (page - 1) * limit;

    const [totalDocs, docs] = await Promise.all([
      ProductModel.countDocuments(filter),
      ProductModel.find(filter).sort(sortOpt).skip(skip).limit(limit).lean()
    ]);

    const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    const base = '/api/products';
    const qp = (p) =>
      `${base}?limit=${limit}&page=${p}${sort ? `&sort=${sort}` : ''}${
        query ? `&query=${encodeURIComponent(query)}` : ''
      }`;

    return {
      status: 'success',
      payload: docs,
      totalPages,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? qp(page - 1) : null,
      nextLink: hasNextPage ? qp(page + 1) : null
    };
  }

  async getProductById(id) {
    const product = await ProductModel.findById(id).lean();
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  async createProduct(productData) {
    const created = await ProductModel.create(productData);
    return created.toObject();
  }

  async updateProduct(id, updateData) {
    const updated = await ProductModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) throw new Error('Producto no encontrado');
    return updated;
  }

  async deleteProduct(id) {
    const deleted = await ProductModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new Error('Producto no encontrado');
    return deleted;
  }
}

module.exports = ProductsService;
