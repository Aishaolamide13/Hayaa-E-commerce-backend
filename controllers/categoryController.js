const { Op } = require('sequelize');
const Category = require('../models/Category');

// Helper to create slug
const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
};

// @desc    Create category (Admin only)
// @route   POST /api/categories
const createCategory = async (req, res, next) => {
    try {
        const { name, description, icon, image, parent, islamicType, sortOrder } = req.body;

        const slug = createSlug(name);

        const existing = await Category.findOne({ where: { slug } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const category = await Category.create({
            name,
            slug,
            description,
            icon,
            image,
            parentId: parent || null,
            islamicType: islamicType || 'Other',
            sortOrder: sortOrder || 0
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all categories (Public)
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
    try {
        const { islamicType, isFeatured } = req.query;
        const where = { isActive: true };

        if (islamicType) where.islamicType = islamicType;
        if (isFeatured) where.isFeatured = isFeatured === 'true';

        const categories = await Category.findAll({
            where,
            include: [{
                model: Category,
                as: 'subcategories',
                where: { isActive: true },
                required: false,
                attributes: ['id', 'name', 'slug', 'description', 'icon']
            }],
            order: [['sortOrder', 'ASC'], ['name', 'ASC']]
        });

        // Get only parent categories
        const parentCategories = categories.filter(c => !c.parentId);

        res.status(200).json({
            success: true,
            count: categories.length,
            data: {
                all: categories,
                parents: parentCategories
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/categories/:slug
const getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await Category.findOne({
            where: { slug: req.params.slug, isActive: true },
            include: [{
                model: Category,
                as: 'subcategories',
                where: { isActive: true },
                required: false
            }]
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
    try {
        const { name, description, icon, image, parent, islamicType, isActive, isFeatured, sortOrder } = req.body;
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        if (name && name !== category.name) {
            const slug = createSlug(name);
            const existing = await Category.findOne({ where: { slug, id: { [Op.ne]: category.id } } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name already taken'
                });
            }
            category.slug = slug;
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (icon !== undefined) category.icon = icon;
        if (image !== undefined) category.image = image;
        if (parent !== undefined) category.parentId = parent;
        if (islamicType) category.islamicType = islamicType;
        if (isActive !== undefined) category.isActive = isActive;
        if (isFeatured !== undefined) category.isFeatured = isFeatured;
        if (sortOrder !== undefined) category.sortOrder = sortOrder;

        await category.save();

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if has subcategories
        const subcategories = await Category.findAll({ where: { parentId: category.id } });
        if (subcategories.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with subcategories. Delete subcategories first.'
            });
        }

        await Category.destroy({ where: { id: req.params.id } });

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory
};