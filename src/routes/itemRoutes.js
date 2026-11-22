const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getFeaturedItems,
  getLowStockItems
} = require('../controllers/itemController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.get('/', getAllItems);
router.get('/featured', getFeaturedItems);
router.get('/low-stock', authenticate, authorize('admin'), getLowStockItems);
router.get('/:id', getItemById);
router.post('/', authenticate, authorize('admin'), validate(schemas.item), createItem);
router.put('/:id', authenticate, authorize('admin'), validate(schemas.item), updateItem);
router.delete('/:id', authenticate, authorize('admin'), deleteItem);

module.exports = router;