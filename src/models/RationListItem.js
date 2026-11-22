const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RationListItem = sequelize.define('RationListItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ration_list_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ration_lists',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.00,
    validate: {
      min: 0.01
    }
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pcs'
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  notes_en: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes_hi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes_te: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_purchased: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  purchased_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  purchased_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
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
  tableName: 'ration_list_items',
  indexes: [
    {
      fields: ['ration_list_id']
    },
    {
      fields: ['item_id']
    },
    {
      fields: ['is_purchased']
    },
    {
      fields: ['sort_order']
    }
  ],
  hooks: {
    beforeSave: (rationListItem) => {
      rationListItem.total_price = parseFloat(rationListItem.quantity) * parseFloat(rationListItem.unit_price);
    }
  }
});

RationListItem.prototype.getNotes = function(lang = 'en') {
  const langMap = {
    en: 'notes_en',
    hi: 'notes_hi',
    te: 'notes_te'
  };
  return this[langMap[lang]] || this.notes_en;
};

module.exports = RationListItem;