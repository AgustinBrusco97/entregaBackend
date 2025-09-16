const crypto = require('crypto');
const ProductsDAO = require('../dao/products.dao');
const config = require('../../config/config');

class ProductsService {
  constructor() {
    this.productsDAO = new ProductsDAO();
  }

  validateProductSchema(product) {
    const errors = [];

    // Validaciones generales
    if (!product.title || typeof product.title !== 'string') {
      errors.push('title es requerido y debe ser string');
    }
    if (!product.description || typeof product.description !== 'string') {
      errors.push('description es requerido y debe ser string');
    }
    if (!product.code || typeof product.code !== 'string') {
      errors.push('code es requerido y debe ser string');
    }
    if (!product.price || typeof product.price !== 'number' || product.price <= 0) {
      errors.push('price es requerido, debe ser number y mayor a 0');
    }
    if (product.stock === undefined || typeof product.stock !== 'number' || product.stock < 0) {
      errors.push('stock es requerido, debe ser number y >= 0');
    }
    if (!product.category || !config.validCategories.includes(product.category)) {
      errors.push(`category debe ser uno de: ${config.validCategories.join(', ')}`);
    }
    if (product.status !== undefined && typeof product.status !== 'boolean') {
      errors.push('status debe ser boolean');
    }
    if (product.thumbnails && !Array.isArray(product.thumbnails)) {
      errors.push('thumbnails debe ser array');
    }

    return errors;
  }

  validateCategorySpecs(category, specs) {
    const errors = [];

    if (!specs || typeof specs !== 'object') {
      errors.push('specs es requerido y debe ser objeto');
      return errors;
    }

    switch (category) {
      case 'flowers':
        if (!specs.strain || typeof specs.strain !== 'string') {
          errors.push('strain es requerido para flowers');
        }
        if (typeof specs.thc !== 'number' || specs.thc < 0) {
          errors.push('thc es requerido para flowers y debe ser number >= 0');
        }
        if (typeof specs.cbd !== 'number' || specs.cbd < 0) {
          errors.push('cbd es requerido para flowers y debe ser number >= 0');
        }
        if (typeof specs.weight !== 'number' || specs.weight <= 0) {
          errors.push('weight es requerido para flowers y debe ser number > 0');
        }
        break;

      case 'extracts':
        if (typeof specs.thc !== 'number' || specs.thc < 0) {
          errors.push('thc es requerido para extracts y debe ser number >= 0');
        }
        if (typeof specs.cbd !== 'number' || specs.cbd < 0) {
          errors.push('cbd es requerido para extracts y debe ser number >= 0');
        }
        if (typeof specs.quantity !== 'number' || specs.quantity <= 0) {
          errors.push('quantity es requerido para extracts y debe ser number > 0');
        }
        break;

      case 'edibles':
        if (typeof specs.thcMg !== 'number' || specs.thcMg < 0) {
          errors.push('thcMg es requerido para edibles y debe ser number >= 0');
        }
        if (typeof specs.units !== 'number' || specs.units <= 0) {
          errors.push('units es requerido para edibles y debe ser number > 0');
        }
        break;

      case 'accessories':
        // Para accesorios las validaciones son más flexibles
        break;
    }

    return errors;
  }

  async getAllProducts(filters = {}) {
    const products = await this.productsDAO.getAll();
    let filteredProducts = [...products];

    // Filtros
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }
    if (filters.status !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.status === filters.status);
    }
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(filters.maxPrice));
    }
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        (p.specs?.strain && p.specs.strain.toLowerCase().includes(searchTerm)) ||
        (p.specs?.format && p.specs.format.toLowerCase().includes(searchTerm)) ||
        (p.specs?.type && p.specs.type.toLowerCase().includes(searchTerm))
      );
    }

    // Ordenamiento
    if (filters.sort) {
      const order = filters.order === 'desc' ? -1 : 1;
      filteredProducts.sort((a, b) => {
        if (filters.sort === 'price') {
          return (a.price - b.price) * order;
        }
        if (filters.sort === 'title') {
          return a.title.localeCompare(b.title) * order;
        }
        if (filters.sort === 'createdAt') {
          return (new Date(a.createdAt) - new Date(b.createdAt)) * order;
        }
        return 0;
      });
    }

    // Paginación
    const limit = Math.min(parseInt(filters.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
    const page = parseInt(filters.page) || 1;
    const skip = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

    return {
      products: paginatedProducts,
      totalProducts: filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit),
      hasNextPage: page < Math.ceil(filteredProducts.length / limit),
      hasPrevPage: page > 1
    };
  }

  async getProductById(id) {
    const product = await this.productsDAO.getById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  async createProduct(productData) {
    // Validar schema general
    const schemaErrors = this.validateProductSchema(productData);
    if (schemaErrors.length > 0) {
      throw new Error(`Errores de validación: ${schemaErrors.join(', ')}`);
    }

    // Validar specs específicos de categoría
    const specErrors = this.validateCategorySpecs(productData.category, productData.specs);
    if (specErrors.length > 0) {
      throw new Error(`Errores de validación de specs: ${specErrors.join(', ')}`);
    }

    // Verificar código único
    const existingProduct = await this.productsDAO.getByCode(productData.code);
    if (existingProduct) {
      throw new Error('El código del producto ya existe');
    }

    // Crear producto
    const product = {
      id: crypto.randomUUID(),
      ...productData,
      status: productData.status !== undefined ? productData.status : true,
      thumbnails: productData.thumbnails || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.productsDAO.create(product);
  }

  async updateProduct(id, updateData) {
    const existingProduct = await this.productsDAO.getById(id);
    if (!existingProduct) {
      throw new Error('Producto no encontrado');
    }

    // No permitir actualizar ID
    if (updateData.id) {
      delete updateData.id;
    }

    // Si se actualiza el código, verificar unicidad
    if (updateData.code && updateData.code !== existingProduct.code) {
      const existingByCode = await this.productsDAO.getByCode(updateData.code);
      if (existingByCode) {
        throw new Error('El código del producto ya existe');
      }
    }

    // Validar si se envían nuevos datos
    if (Object.keys(updateData).length > 0) {
      const mergedProduct = { ...existingProduct, ...updateData };
      
      const schemaErrors = this.validateProductSchema(mergedProduct);
      if (schemaErrors.length > 0) {
        throw new Error(`Errores de validación: ${schemaErrors.join(', ')}`);
      }

      if (updateData.specs || updateData.category) {
        const specs = updateData.specs || existingProduct.specs;
        const category = updateData.category || existingProduct.category;
        const specErrors = this.validateCategorySpecs(category, specs);
        if (specErrors.length > 0) {
          throw new Error(`Errores de validación de specs: ${specErrors.join(', ')}`);
        }
      }
    }

    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return await this.productsDAO.update(id, dataToUpdate);
  }

  async deleteProduct(id) {
    const deletedProduct = await this.productsDAO.delete(id);
    if (!deletedProduct) {
      throw new Error('Producto no encontrado');
    }
    return deletedProduct;
  }
}

module.exports = ProductsService;
