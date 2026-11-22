const express = require('express');
const router = express.Router();
const {
  getAllRationLists,
  getRationListById,
  createRationList,
  updateRationList,
  deleteRationList,
  addItemToList,
  updateListItem,
  removeItemFromList,
  toggleItemPurchased,
  getTemplates,
  createFromTemplate
} = require('../controllers/rationListController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.get('/', authenticate, getAllRationLists);
router.get('/templates', authenticate, getTemplates);
router.get('/:id', authenticate, getRationListById);
router.post('/', authenticate, validate(schemas.rationList), createRationList);
router.put('/:id', authenticate, validate(schemas.rationList), updateRationList);
router.delete('/:id', authenticate, deleteRationList);
router.post('/:id/items', authenticate, validate(schemas.rationListItem), addItemToList);
router.put('/:id/items/:itemId', authenticate, validate(schemas.rationListItem), updateListItem);
router.delete('/:id/items/:itemId', authenticate, removeItemFromList);
router.patch('/:id/items/:itemId/purchase', authenticate, toggleItemPurchased);
router.post('/templates/:templateId/create', authenticate, createFromTemplate);

module.exports = router;