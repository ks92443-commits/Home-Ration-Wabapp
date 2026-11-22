const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Item = require('./Item');
const RationList = require('./RationList');
const RationListItem = require('./RationListItem');

// Define associations
Category.hasMany(Item, { foreignKey: 'category_id', as: 'items' });
Item.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

User.hasMany(RationList, { foreignKey: 'user_id', as: 'rationLists' });
RationList.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

RationList.hasMany(RationListItem, { foreignKey: 'ration_list_id', as: 'listItems', onDelete: 'CASCADE' });
RationListItem.belongsTo(RationList, { foreignKey: 'ration_list_id', as: 'rationList' });

Item.hasMany(RationListItem, { foreignKey: 'item_id', as: 'rationListItems' });
RationListItem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

module.exports = {
  sequelize,
  User,
  Category,
  Item,
  RationList,
  RationListItem
};