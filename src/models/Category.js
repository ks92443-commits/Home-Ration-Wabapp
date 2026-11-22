const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name_en: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  name_hi: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  name_te: {
    type: DataTypes.STRING(100),
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
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    validate: {
      is: /^#[0-9A-Fa-f]{6}$/
    }
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'categories',
  indexes: [
    {
      fields: ['sort_order']
    },
    {
      fields: ['is_active']
    }
  ]
});

Category.prototype.getName = function(lang = 'en') {
  const langMap = {
    en: 'name_en',
    hi: 'name_hi',
    te: 'name_te'
  };
  return this[langMap[lang]] || this.name_en;
};

Category.prototype.getDescription = function(lang = 'en') {
  const langMap = {
    en: 'description_en',
    hi: 'description_hi',
    te: 'description_te'
  };
  return this[langMap[lang]] || this.description_en;
};

module.exports = Category;