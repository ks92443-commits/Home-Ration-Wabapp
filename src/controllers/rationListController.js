const { RationList, RationListItem, Item, Category, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const getAllRationLists = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = null,
      isTemplate = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const lang = req.language || 'en';
    const userId = req.user.id;

    const where = { user_id: userId };

    if (search) {
      where[Op.or] = [
        { name_en: { [Op.iLike]: `%${search}%` } },
        { name_hi: { [Op.iLike]: `%${search}%` } },
        { name_te: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (isTemplate !== null && isTemplate !== '') {
      where.is_template = isTemplate === 'true';
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await RationList.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: RationListItem,
          as: 'listItems',
          attributes: ['id', 'is_purchased'],
          required: false,
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'unit_price']
            }
          ]
        }
      ]
    });

    const lists = rows.map(list => {
      const items = list.listItems || [];
      const totalItems = items.length;
      const purchasedItems = items.filter(i => i.is_purchased).length;
      const estimatedCost = items.reduce((sum, i) => sum + parseFloat(i.total_price || 0), 0);
      const actualCost = items
        .filter(i => i.is_purchased && i.purchased_price)
        .reduce((sum, i) => sum + parseFloat(i.purchased_price) * parseFloat(i.purchased_quantity || i.quantity), 0);

      return {
        id: list.id,
        name: list.getName(lang),
        name_en: list.name_en,
        name_hi: list.name_hi,
        name_te: list.name_te,
        description: list.getDescription(lang),
        description_en: list.description_en,
        description_hi: list.description_hi,
        description_te: list.description_te,
        status: list.status,
        total_estimated_cost: parseFloat(list.total_estimated_cost),
        is_template: list.is_template,
        template_name: list.template_name,
        total_items: totalItems,
        purchased_items: purchasedItems,
        pending_items: totalItems - purchasedItems,
        estimated_cost: estimatedCost,
        actual_cost: actualCost,
        created_at: list.created_at,
        updated_at: list.updated_at
      };
    });

    res.json({
      success: true,
      data: {
        lists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get ration lists error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const getRationListById = async (req, res) => {
  try {
    const { id } = req.params;
    const lang = req.language || 'en';
    const userId = req.user.id;

    const list = await RationList.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: RationListItem,
          as: 'listItems',
          order: [['sort_order', 'ASC']],
          include: [
            {
              model: Item,
              as: 'item',
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    const items = list.listItems || [];
    const totalItems = items.length;
    const purchasedItems = items.filter(i => i.is_purchased).length;
    const estimatedCost = items.reduce((sum, i) => sum + parseFloat(i.total_price || 0), 0);
    const actualCost = items
      .filter(i => i.is_purchased && i.purchased_price)
      .reduce((sum, i) => sum + parseFloat(i.purchased_price) * parseFloat(i.purchased_quantity || i.quantity), 0);

    res.json({
      success: true,
      data: {
        list: {
          id: list.id,
          name: list.getName(lang),
          name_en: list.name_en,
          name_hi: list.name_hi,
          name_te: list.name_te,
          description: list.getDescription(lang),
          description_en: list.description_en,
          description_hi: list.description_hi,
          description_te: list.description_te,
          status: list.status,
          total_estimated_cost: parseFloat(list.total_estimated_cost),
          is_template: list.is_template,
          template_name: list.template_name,
          items: items.map(li => ({
            id: li.id,
            ration_list_id: li.ration_list_id,
            item_id: li.item_id,
            quantity: parseFloat(li.quantity),
            unit: li.unit,
            unit_price: parseFloat(li.unit_price),
            total_price: parseFloat(li.total_price),
            notes: li.getNotes(lang),
            notes_en: li.notes_en,
            notes_hi: li.notes_hi,
            notes_te: li.notes_te,
            is_purchased: li.is_purchased,
            purchased_quantity: parseFloat(li.purchased_quantity),
            purchased_price: li.purchased_price ? parseFloat(li.purchased_price) : null,
            sort_order: li.sort_order,
            item: li.item ? {
              ...li.item.getLocalized(lang),
              category: li.item.category ? {
                id: li.item.category.id,
                name: li.item.category.getName(lang),
                name_en: li.item.category.name_en,
                name_hi: li.item.category.name_hi,
                name_te: li.item.category.name_te,
                icon: li.item.category.icon,
                color: li.item.category.color
              } : null
            } : null
          })),
          summary: {
            total_items: totalItems,
            purchased_items: purchasedItems,
            pending_items: totalItems - purchasedItems,
            estimated_cost: estimatedCost,
            actual_cost: actualCost
          },
          created_at: list.created_at,
          updated_at: list.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get ration list error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const createRationList = async (req, res) => {
  try {
    const {
      nameEn,
      nameHi,
      nameTe,
      descriptionEn,
      descriptionHi,
      descriptionTe,
      status,
      isTemplate,
      templateName
    } = req.body;

    const userId = req.user.id;

    const list = await RationList.create({
      user_id: userId,
      name_en: nameEn,
      name_hi: nameHi,
      name_te: nameTe,
      description_en: descriptionEn,
      description_hi: descriptionHi,
      description_te: descriptionTe,
      status: status || 'draft',
      is_template: isTemplate || false,
      template_name: templateName
    });

    res.status(201).json({
      success: true,
      message: req.t('lists.createSuccess'),
      data: { list }
    });
  } catch (error) {
    console.error('Create ration list error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const updateRationList = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nameEn,
      nameHi,
      nameTe,
      descriptionEn,
      descriptionHi,
      descriptionTe,
      status,
      isTemplate,
      templateName
    } = req.body;

    const userId = req.user.id;

    const list = await RationList.findOne({ where: { id, user_id: userId } });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    await list.update({
      name_en: nameEn,
      name_hi: nameHi,
      name_te: nameTe,
      description_en: descriptionEn,
      description_hi: descriptionHi,
      description_te: descriptionTe,
      status,
      is_template: isTemplate,
      template_name: templateName
    });

    res.json({
      success: true,
      message: req.t('lists.updateSuccess'),
      data: { list }
    });
  } catch (error) {
    console.error('Update ration list error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const deleteRationList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const list = await RationList.findOne({ where: { id, user_id: userId } });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    await list.destroy();

    res.json({
      success: true,
      message: req.t('lists.deleteSuccess')
    });
  } catch (error) {
    console.error('Delete ration list error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const addItemToList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      itemId,
      quantity,
      unit,
      unitPrice,
      notesEn,
      notesHi,
      notesTe,
      sortOrder
    } = req.body;

    const list = await RationList.findOne({ where: { id, user_id: userId } });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    const item = await Item.findByPk(itemId);

    if (!item) {
      return res.status(400).json({
        success: false,
        message: req.t('errors.notFound') + ' - Item',
        code: 'INVALID_ITEM'
      });
    }

    const maxSortOrder = await RationListItem.max('sort_order', {
      where: { ration_list_id: id }
    });

    const listItem = await RationListItem.create({
      ration_list_id: id,
      item_id: itemId,
      quantity,
      unit: unit || item.unit,
      unit_price: unitPrice || item.unit_price,
      notes_en: notesEn,
      notes_hi: notesHi,
      notes_te: notesTe,
      sort_order: sortOrder !== undefined ? sortOrder : (maxSortOrder || 0) + 1
    });

    await updateListTotalCost(id);

    const createdItem = await RationListItem.findByPk(listItem.id, {
      include: [
        {
          model: Item,
          as: 'item',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
            }
          ]
        }
      ]
    });

    const lang = req.language || 'en';

    res.status(201).json({
      success: true,
      message: req.t('lists.addItem'),
      data: {
        listItem: {
          id: createdItem.id,
          ration_list_id: createdItem.ration_list_id,
          item_id: createdItem.item_id,
          quantity: parseFloat(createdItem.quantity),
          unit: createdItem.unit,
          unit_price: parseFloat(createdItem.unit_price),
          total_price: parseFloat(createdItem.total_price),
          notes: createdItem.getNotes(lang),
          notes_en: createdItem.notes_en,
          notes_hi: createdItem.notes_hi,
          notes_te: createdItem.notes_te,
          is_purchased: createdItem.is_purchased,
          purchased_quantity: parseFloat(createdItem.purchased_quantity),
          purchased_price: createdItem.purchased_price ? parseFloat(createdItem.purchased_price) : null,
          sort_order: createdItem.sort_order,
          item: createdItem.item ? {
            ...createdItem.item.getLocalized(lang),
            category: createdItem.item.category ? {
              id: createdItem.item.category.id,
              name: createdItem.item.category.getName(lang),
              name_en: createdItem.item.category.name_en,
              name_hi: createdItem.item.category.name_hi,
              name_te: createdItem.item.category.name_te,
              icon: createdItem.item.category.icon,
              color: createdItem.item.category.color
            } : null
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Add item to list error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const updateListItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.user.id;
    const {
      quantity,
      unit,
      unitPrice,
      notesEn,
      notesHi,
      notesTe,
      isPurchased,
      purchasedQuantity,
      purchasedPrice,
      sortOrder
    } = req.body;

    const list = await RationList.findOne({ where: { id, user_id: userId } });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    const listItem = await RationListItem.findOne({
      where: { id: itemId, ration_list_id: id }
    });

    if (!listItem) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    await listItem.update({
      quantity,
      unit,
      unit_price: unitPrice,
      notes_en: notesEn,
      notes_hi: notesHi,
      notes_te: notesTe,
      is_purchased: isPurchased,
      purchased_quantity: purchasedQuantity,
      purchased_price: purchasedPrice,
      sort_order: sortOrder
    });

    await updateListTotalCost(id);

    const updatedItem = await RationListItem.findByPk(itemId, {
      include: [
        {
          model: Item,
          as: 'item',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
            }
          ]
        }
      ]
    });

    const lang = req.language || 'en';

    res.json({
      success: true,
      message: req.t('lists.editItem'),
      data: {
        listItem: {
          id: updatedItem.id,
          ration_list_id: updatedItem.ration_list_id,
          item_id: updatedItem.item_id,
          quantity: parseFloat(updatedItem.quantity),
          unit: updatedItem.unit,
          unit_price: parseFloat(updatedItem.unit_price),
          total_price: parseFloat(updatedItem.total_price),
          notes: updatedItem.getNotes(lang),
          notes_en: updatedItem.notes_en,
          notes_hi: updatedItem.notes_hi,
          notes_te: updatedItem.notes_te,
          is_purchased: updatedItem.is_purchased,
          purchased_quantity: parseFloat(updatedItem.purchased_quantity),
          purchased_price: updatedItem.purchased_price ? parseFloat(updatedItem.purchased_price) : null,
          sort_order: updatedItem.sort_order,
          item: updatedItem.item ? {
            ...updatedItem.item.getLocalized(lang),
            category: updatedItem.item.category ? {
              id: updatedItem.item.category.id,
              name: updatedItem.item.category.getName(lang),
              name_en: updatedItem.item.category.name_en,
              name_hi: updatedItem.item.category.name_hi,
              name_te: updatedItem.item.category.name_te,
              icon: updatedItem.item.category.icon,
              color: updatedItem.item.category.color
            } : null
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Update list item error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const removeItemFromList = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.user.id;

    const list = await RationList.findOne({ where: { id, user_id: userId } });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    const listItem = await RationListItem.findOne({
      where: { id: itemId, ration_list_id: id }
    });

    if (!listItem) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    await listItem.destroy();
    await updateListTotalCost(id);

    res.json({
      success: true,
      message: req.t('lists.removeItem')
    });
  } catch (error) {
    console.error('Remove item from list error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const toggleItemPurchased = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.user.id;
    const { isPurchased, purchasedQuantity, purchasedPrice } = req.body;

    const list = await RationList.findOne({ where: { id, user_id: userId } });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    const listItem = await RationListItem.findOne({
      where: { id: itemId, ration_list_id: id }
    });

    if (!listItem) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    await listItem.update({
      is_purchased: isPurchased,
      purchased_quantity: purchasedQuantity || (isPurchased ? listItem.quantity : 0),
      purchased_price: purchasedPrice
    });

    await updateListTotalCost(id);

    const lang = req.language || 'en';

    res.json({
      success: true,
      message: isPurchased ? req.t('lists.markPurchased') : req.t('lists.markPending'),
      data: {
        listItem: {
          id: listItem.id,
          is_purchased: isPurchased,
          purchased_quantity: parseFloat(purchasedQuantity || (isPurchased ? listItem.quantity : 0)),
          purchased_price: purchasedPrice ? parseFloat(purchased_price) : null
        }
      }
    });
  } catch (error) {
    console.error('Toggle item purchased error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const updateListTotalCost = async (listId) => {
  const items = await RationListItem.findAll({
    where: { ration_list_id: listId }
  });

  const totalCost = items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);

  await RationList.update(
    { total_estimated_cost: totalCost },
    { where: { id: listId } }
  );
};

const getTemplates = async (req, res) => {
  try {
    const lang = req.language || 'en';
    const userId = req.user.id;

    const lists = await RationList.findAll({
      where: {
        user_id: userId,
        is_template: true
      },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: RationListItem,
          as: 'listItems',
          attributes: ['id', 'item_id', 'quantity', 'unit', 'unit_price', 'total_price'],
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'name_en', 'name_hi', 'name_te', 'unit', 'unit_price', 'image_url'],
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['id', 'name_en', 'name_hi', 'name_te', 'icon', 'color']
                }
              ]
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: {
        templates: lists.map(list => ({
          id: list.id,
          name: list.getName(lang),
          name_en: list.name_en,
          name_hi: list.name_hi,
          name_te: list.name_te,
          description: list.getDescription(lang),
          template_name: list.template_name,
          items_count: list.listItems?.length || 0,
          estimated_cost: list.listItems?.reduce((sum, i) => sum + parseFloat(i.total_price || 0), 0) || 0,
          created_at: list.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const createFromTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user.id;
    const { nameEn, nameHi, nameTe } = req.body;

    const template = await RationList.findOne({
      where: { id: templateId, user_id: userId, is_template: true },
      include: [
        {
          model: RationListItem,
          as: 'listItems',
          include: [
            {
              model: Item,
              as: 'item'
            }
          ]
        }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: req.t('errors.notFound'),
        code: 'NOT_FOUND'
      });
    }

    const newList = await RationList.create({
      user_id: userId,
      name_en: nameEn || `${template.name_en} (Copy)`,
      name_hi: nameHi || `${template.name_hi} (कॉपी)`,
      name_te: nameTe || `${template.name_te} (కాపీ)`,
      description_en: template.description_en,
      description_hi: template.description_hi,
      description_te: template.description_te,
      status: 'draft',
      is_template: false
    });

    if (template.listItems && template.listItems.length > 0) {
      const listItems = template.listItems.map(item => ({
        ration_list_id: newList.id,
        item_id: item.item_id,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        notes_en: item.notes_en,
        notes_hi: item.notes_hi,
        notes_te: item.notes_te,
        sort_order: item.sort_order
      }));

      await RationListItem.bulkCreate(listItems);
      await updateListTotalCost(newList.id);
    }

    res.status(201).json({
      success: true,
      message: req.t('lists.createSuccess'),
      data: { list: newList }
    });
  } catch (error) {
    console.error('Create from template error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
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
};