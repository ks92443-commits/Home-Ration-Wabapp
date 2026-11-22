const { Item, Category } = require('../models');
const { Op } = require('sequelize');

const getAllItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      categoryId = null,
      isActive = null,
      isFeatured = null,
      sortBy = 'sort_order',
      sortOrder = 'ASC',
      minPrice = null,
      maxPrice = null
    } = req.query;

    const lang = req.language || 'en';
    const where = {};

    if (search) {
      where[Op.or] = [
        { name_en: { [Op.iLike]: `%${search}%` } },
        { name_hi: { [Op.iLike]: `%${search}%` } },
        { name_te: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    if (isActive !== null && isActive !== '') {
      where.is_active = isActive === 'true';
    }

    if (isFeatured !== null && isFeatured !== '') {
      where.is_featured = isFeatured === 'true';
    }

    if (minPrice !== null && minPrice !== '') {
      where.unit_price = { ...where.unit_price, [Op.gte]: parseFloat(minPrice) };
    }

    if (maxPrice !== null && maxPrice !== '') {
      where.unit_price = { ...where.unit_price, [Op.lte]: parseFloat(maxPrice) };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Item.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
        }
      ]
    });

    const items = rows.map(item => ({
      ...item.getLocalized(lang),
      category: item.category ? {
        id: item.category.id,
        name: item.category.getName(lang),
        name_en: item.category.name_en,
        name_hi: item.category.name_hi,
        name_te: item.category.name_te,
        icon: item.category.icon,
        color: item.category.color
      } : null,
      stock_status: item.stock_quantity <= 0 ? 'out_of_stock' :
                    item.stock_quantity <= item.min_stock_level ? 'low_stock' : 'in_stock'
    }));

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const lang = req.language || 'en';

    const item = await Item.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
        }
      ]
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        item: {
          ...item.getLocalized(lang),
          category: item.category ? {
            id: item.category.id,
            name: item.category.getName(lang),
            name_en: item.category.name_en,
            name_hi: item.category.name_hi,
            name_te: item.category.name_te,
            icon: item.category.icon,
            color: item.category.color
          } : null,
          stock_status: item.stock_quantity <= 0 ? 'out_of_stock' :
                        item.stock_quantity <= item.min_stock_level ? 'low_stock' : 'in_stock'
        }
      }
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const createItem = async (req, res) => {
  try {
    const {
      categoryId,
      nameEn,
      nameHi,
      nameTe,
      descriptionEn,
      descriptionHi,
      descriptionTe,
      unit,
      unitPrice,
      mrp,
      brandEn,
      brandHi,
      brandTe,
      barcode,
      imageUrl,
      tags,
      isActive,
      isFeatured,
      stockQuantity,
      minStockLevel,
      sortOrder
    } = req.body;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(400).json({
        success: false,
        message: req.t('errors.notFound') + ' - Category',
        code: 'INVALID_CATEGORY'
      });
    }

    if (barcode) {
      const existingBarcode = await Item.findOne({ where: { barcode } });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Barcode already exists',
          code: 'BARCODE_EXISTS'
        });
      }
    }

    const item = await Item.create({
      category_id: categoryId,
      name_en: nameEn,
      name_hi: nameHi,
      name_te: nameTe,
      description_en: descriptionEn,
      description_hi: descriptionHi,
      description_te: descriptionTe,
      unit,
      unit_price: unitPrice,
      mrp,
      brand_en: brandEn,
      brand_hi: brandHi,
      brand_te: brandTe,
      barcode,
      image_url: imageUrl,
      tags,
      is_active: isActive,
      is_featured: isFeatured,
      stock_quantity: stockQuantity,
      min_stock_level: minStockLevel,
      sort_order: sortOrder
    });

    const createdItem = await Item.findByPk(item.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: req.t('items.createSuccess'),
      data: { item: createdItem.getLocalized(lang) }
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      nameEn,
      nameHi,
      nameTe,
      descriptionEn,
      descriptionHi,
      descriptionTe,
      unit,
      unitPrice,
      mrp,
      brandEn,
      brandHi,
      brandTe,
      barcode,
      imageUrl,
      tags,
      isActive,
      isFeatured,
      stockQuantity,
      minStockLevel,
      sortOrder
    } = req.body;

    const lang = req.language || 'en';

    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: req.t('errors.notFound') + ' - Category',
          code: 'INVALID_CATEGORY'
        });
      }
    }

    if (barcode && barcode !== item.barcode) {
      const existingBarcode = await Item.findOne({ where: { barcode } });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Barcode already exists',
          code: 'BARCODE_EXISTS'
        });
      }
    }

    await item.update({
      category_id: categoryId,
      name_en: nameEn,
      name_hi: nameHi,
      name_te: nameTe,
      description_en: descriptionEn,
      description_hi: descriptionHi,
      description_te: descriptionTe,
      unit,
      unit_price: unitPrice,
      mrp,
      brand_en: brandEn,
      brand_hi: brandHi,
      brand_te: brandTe,
      barcode,
      image_url: imageUrl,
      tags,
      is_active: isActive,
      is_featured: isFeatured,
      stock_quantity: stockQuantity,
      min_stock_level: minStockLevel,
      sort_order: sortOrder
    });

    const updatedItem = await Item.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
        }
      ]
    });

    res.json({
      success: true,
      message: req.t('items.updateSuccess'),
      data: { item: updatedItem.getLocalized(lang) }
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    await item.destroy();

    res.json({
      success: true,
      message: req.t('items.deleteSuccess')
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const getFeaturedItems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const lang = req.language || 'en';

    const items = await Item.findAll({
      where: {
        is_active: true,
        is_featured: true
      },
      order: [['sort_order', 'ASC']],
      limit: parseInt(limit),
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        items: items.map(item => ({
          ...item.getLocalized(lang),
          category: item.category ? {
            id: item.category.id,
            name: item.category.getName(lang),
            name_en: item.category.name_en,
            name_hi: item.category.name_hi,
            name_te: item.category.name_te,
            icon: item.category.icon,
            color: item.category.color
          } : null
        }))
      }
    });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const lang = req.language || 'en';

    const items = await Item.findAll({
      where: {
        is_active: true,
        stock_quantity: {
          [Op.lte]: sequelize.col('min_stock_level')
        }
      },
      order: [['stock_quantity', 'ASC']],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        items: items.map(item => ({
          ...item.getLocalized(lang),
          category: item.category ? {
            id: item.category.id,
            name: item.category.getName(lang),
            name_en: item.category.name_en,
            name_hi: item.category.name_hi,
            name_te: item.category.name_te,
            icon: item.category.icon,
            color: item.category.color
          } : null,
          stock_status: item.stock_quantity <= 0 ? 'out_of_stock' : 'low_stock'
        }))
      }
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getFeaturedItems,
  getLowStockItems
};