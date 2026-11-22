const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  name_en: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  name_hi: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  name_te: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description_en: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_hi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_te: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pcs',
    validate: {
      isIn: [['pcs', 'kg', 'g', 'ltr', 'ml', 'pack', 'box', 'dozen']]
    }
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  mrp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  brand_en: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  brand_hi: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  brand_te: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  barcode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'items',
  indexes: [
    {
      fields: ['category_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['sort_order']
    },
    {
      fields: ['name_en']
    },
    {
      fields: ['barcode']
    }
  ]
});

Item.prototype.getName = function(lang = 'en') {
  const langMap = {
    en: 'name_en',
    hi: 'name_hi',
    te: 'name_te'
  };
  return this[langMap[lang]] || this.name_en;
};

Item.prototype.getDescription = function(lang = 'en') {
  const langMap = {
    en: 'description_en',
    hi: 'description_hi',
    te: 'description_te'
  };
  return this[langMap[lang]] || this.description_en;
};

Item.prototype.getBrand = function(lang = 'en') {
  const langMap = {
    en: 'brand_en',
    hi: 'brand_hi',
    te: 'brand_te'
  };
  return this[langMap[lang]] || this.brand_en;
};

Item.prototype.getLocalized = function(lang = 'en') {
  return {
    id: this.id,
    category_id: this.category_id,
    name: this.getName(lang),
    description: this.getDescription(lang),
    unit: this.unit,
    unit_price: this.unit_price,
    mrp: this.mrp,
    brand: this.getBrand(lang),
    barcode: this.barcode,
    image_url: this.image_url,
    tags: this.tags,
    is_active: this.is_active,
    is_featured: this.is_featured,
    stock_quantity: this.stock_quantity,
    min_stock_level: this.min_stock_level
  };
};

module.exports = Item;