const { Category, Item } = require('../models');
const { Op } = require('sequelize');

const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', isActive = null, sortBy = 'sort_order', sortOrder = 'ASC' } = req.query;
    const lang = req.language || 'en';

    const where = {};

    if (search) {
      where[Op.or] = [
        { name_en: { [Op.iLike]: `%${search}%` } },
        { name_hi: { [Op.iLike]: `%${search}%` } },
        { name_te: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== null && isActive !== '') {
      where.is_active = isActive === 'true';
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Category.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Item,
          as: 'items',
          attributes: ['id'],
          where: { is_active: true },
          required: false
        }
      ]
    });

    const categories = rows.map(category => ({
      id: category.id,
      name: category.getName(lang),
      name_en: category.name_en,
      name_hi: category.name_hi,
      name_te: category.name_te,
      description: category.getDescription(lang),
      description_en: category.description_en,
      description_hi: category.description_hi,
      description_te: category.description_te,
      icon: category.icon,
      color: category.color,
      sort_order: category.sort_order,
      is_active: category.is_active,
      items_count: category.items?.length || 0,
      created_at: category.created_at,
      updated_at: category.updated_at
    }));

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const lang = req.language || 'en';

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Item,
          as: 'items',
          where: { is_active: true },
          required: false,
          order: [['sort_order', 'ASC']]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.getName(lang),
          name_en: category.name_en,
          name_hi: category.name_hi,
          name_te: category.name_te,
          description: category.getDescription(lang),
          description_en: category.description_en,
          description_hi: category.description_hi,
          description_te: category.description_te,
          icon: category.icon,
          color: category.color,
          sort_order: category.sort_order,
          is_active: category.is_active,
          items: category.items?.map(item => item.getLocalized(lang)) || [],
          created_at: category.created_at,
          updated_at: category.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { nameEn, nameHi, nameTe, descriptionEn, descriptionHi, descriptionTe, icon, color, sortOrder, isActive } = req.body;

    const category = await Category.create({
      name_en: nameEn,
      name_hi: nameHi,
      name_te: nameTe,
      description_en: descriptionEn,
      description_hi: descriptionHi,
      description_te: descriptionTe,
      icon,
      color,
      sort_order: sortOrder,
      is_active: isActive
    });

    res.status(201).json({
      success: true,
      message: req.t('categories.createSuccess'),
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nameEn, nameHi, nameTe, descriptionEn, descriptionHi, descriptionTe, icon, color, sortOrder, isActive } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    await category.update({
      name_en: nameEn,
      name_hi: nameHi,
      name_te: nameTe,
      description_en: descriptionEn,
      description_hi: descriptionHi,
      description_te: descriptionTe,
      icon,
      color,
      sort_order: sortOrder,
      is_active: isActive
    });

    res.json({
      success: true,
      message: req.t('categories.updateSuccess'),
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    const itemsCount = await Item.count({ where: { category_id: id } });

    if (itemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: req.t('categories.deleteConfirm') + ` (${itemsCount} items)`,
        code: 'HAS_ITEMS'
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: req.t('categories.deleteSuccess')
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};