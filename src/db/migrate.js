const sequelize = require('../config/database');
const { User, Category, Item, RationList, RationListItem } = require('../models');

const migrate = async () => {
  try {
    console.log('Starting database migration...');

    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('All tables created/updated successfully.');

    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();