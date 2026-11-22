const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RationList = sequelize.define('RationList', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name_en: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'My Ration List',
    validate: {
      notEmpty: true
    }
  },
  name_hi: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'मेरी राशन सूची',
    validate: {
      notEmpty: true
    }
  },
  name_te: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'నా రేషన్ લિસ્ટ్',
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
  status: {
    type: DataTypes.ENUM('draft', 'active', 'completed', 'archived'),
    defaultValue: 'draft',
    allowNull: false
  },
  total_estimated_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  is_template: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  template_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'ration_lists',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_template']
    }
  ]
});

RationList.prototype.getName = function(lang = 'en') {
  const langMap = {
    en: 'name_en',
    hi: 'name_hi',
    te: 'name_te'
  };
  return this[langMap[lang]] || this.name_en;
};

RationList.prototype.getDescription = function(lang = 'en') {
  const langMap = {
    en: 'description_en',
    hi: 'description_hi',
    te: 'description_te'
  };
  return this[langMap[lang]] || this.description_en;
};

module.exports = RationList;