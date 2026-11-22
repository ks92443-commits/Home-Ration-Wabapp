const Joi = require('joi');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      return res.status(400).json({
        success: false,
        message: req.t('common.validation'),
        code: 'VALIDATION_ERROR',
        details
      });
    }

    req[property] = value;
    next();
  };
};

const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().max(100).required(),
    password: Joi.string().min(6).max(100).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    fullName: Joi.string().max(100).allow(''),
    phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).allow(''),
    address: Joi.string().max(500).allow(''),
    preferredLanguage: Joi.string().valid('en', 'hi', 'te').default('en')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(false)
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required(),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().max(100).allow(''),
    phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).allow(''),
    address: Joi.string().max(500).allow(''),
    preferredLanguage: Joi.string().valid('en', 'hi', 'te')
  }),

  category: Joi.object({
    nameEn: Joi.string().max(100).required(),
    nameHi: Joi.string().max(100).required(),
    nameTe: Joi.string().max(100).required(),
    descriptionEn: Joi.string().max(1000).allow(''),
    descriptionHi: Joi.string().max(1000).allow(''),
    descriptionTe: Joi.string().max(1000).allow(''),
    icon: Joi.string().max(100).allow(''),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow(''),
    sortOrder: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true)
  }),

  item: Joi.object({
    categoryId: Joi.number().integer().positive().required(),
    nameEn: Joi.string().max(150).required(),
    nameHi: Joi.string().max(150).required(),
    nameTe: Joi.string().max(150).required(),
    descriptionEn: Joi.string().max(2000).allow(''),
    descriptionHi: Joi.string().max(2000).allow(''),
    descriptionTe: Joi.string().max(2000).allow(''),
    unit: Joi.string().valid('pcs', 'kg', 'g', 'ltr', 'ml', 'pack', 'box', 'dozen').default('pcs'),
    unitPrice: Joi.number().precision(2).min(0).default(0),
    mrp: Joi.number().precision(2).min(0).allow(null),
    brandEn: Joi.string().max(100).allow(''),
    brandHi: Joi.string().max(100).allow(''),
    brandTe: Joi.string().max(100).allow(''),
    barcode: Joi.string().max(50).allow(''),
    imageUrl: Joi.string().uri().max(500).allow(''),
    tags: Joi.array().items(Joi.string().max(50)).default([]),
    isActive: Joi.boolean().default(true),
    isFeatured: Joi.boolean().default(false),
    stockQuantity: Joi.number().integer().min(0).default(0),
    minStockLevel: Joi.number().integer().min(0).default(5),
    sortOrder: Joi.number().integer().min(0).default(0)
  }),

  rationList: Joi.object({
    nameEn: Joi.string().max(100).required(),
    nameHi: Joi.string().max(100).required(),
    nameTe: Joi.string().max(100).required(),
    descriptionEn: Joi.string().max(1000).allow(''),
    descriptionHi: Joi.string().max(1000).allow(''),
    descriptionTe: Joi.string().max(1000).allow(''),
    status: Joi.string().valid('draft', 'active', 'completed', 'archived').default('draft'),
    isTemplate: Joi.boolean().default(false),
    templateName: Joi.string().max(100).allow('')
  }),

  rationListItem: Joi.object({
    itemId: Joi.number().integer().positive().required(),
    quantity: Joi.number().precision(2).min(0.01).required(),
    unit: Joi.string().valid('pcs', 'kg', 'g', 'ltr', 'ml', 'pack', 'box', 'dozen').default('pcs'),
    unitPrice: Joi.number().precision(2).min(0).default(0),
    notesEn: Joi.string().max(1000).allow(''),
    notesHi: Joi.string().max(1000).allow(''),
    notesTe: Joi.string().max(1000).allow(''),
    isPurchased: Joi.boolean().default(false),
    purchasedQuantity: Joi.number().precision(2).min(0).default(0),
    purchasedPrice: Joi.number().precision(2).min(0).allow(null),
    sortOrder: Joi.number().integer().min(0).default(0)
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().max(50).default('created_at'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
    search: Joi.string().max(100).allow(''),
    categoryId: Joi.number().integer().positive().allow(null),
    status: Joi.string().max(50).allow(''),
    isActive: Joi.boolean().allow(null)
  })
};

module.exports = {
  validate,
  schemas
};