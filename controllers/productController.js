const { Op } = require('sequelize');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');

// Helper to create slug
const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100);
};

// @desc    Create product (Vendor only)
// @route   POST /api/products
const createProduct = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found. Please register as a vendor first.'
            });
        }

        if (vendor.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Your vendor account must be verified before adding products.'
            });
        }

        const { name, description, shortDescription, price, comparePrice, costPrice, stock, category, subcategory, images, isHalal, halalCertification, islamicTags, attributes, weight, dimensions, isFreeShipping, shippingPrice, sku } = req.body;

        // Generate slug
        let slug = createSlug(name);
        const existingSlug = await Product.findOne({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        // Generate SKU if not provided
        const productSku = sku || `${vendor.storeSlug.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

        const product = await Product.create({
            vendorId: vendor.id,
            name,
            slug,
            description,
            shortDescription,
            price,
            comparePrice,
            costPrice,
            stock,
            categoryId: category,
            subcategoryId: subcategory || null,
            images: images || [],
            isHalal: isHalal !== undefined ? isHalal : true,
            halalCertification,
            islamicTags: islamicTags || [],
            attributes: attributes || [],
            weight,
            dimensions,
            isFreeShipping: isFreeShipping || false,
            shippingPrice,
            sku: productSku,
            status: 'pending',
        });

        // Update vendor product count
        await Vendor.update(
            { totalProducts: vendor.totalProducts + 1 },
            { where: { id: vendor.id } }
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully. Awaiting admin approval.',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor's products
// @route   GET /api/products/mine
const getMyProducts = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        const { status, page = 1, limit = 20 } = req.query;
        const where = { vendorId: vendor.id };

        if (status) where.status = status;

        const products = await Product.findAll({
            where,
            include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
            order: [['createdAt', 'DESC']],
            offset: (page - 1) * limit,
            limit: Number(limit)
        });

        const total = await Product.count({ where });

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product (Vendor only)
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        let product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.vendorId !== vendor.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own products'
            });
        }

        const { name, description, shortDescription, price, comparePrice, stock, category, images, isHalal, islamicTags, attributes, status } = req.body;

        if (name && name !== product.name) {
            let slug = createSlug(name);
            const existingSlug = await Product.findOne({ where: { slug, id: { [Op.ne]: product.id } } });
            if (existingSlug) {
                slug = `${slug}-${Date.now().toString(36)}`;
            }
            product.slug = slug;
        }

        if (name) product.name = name;
        if (description) product.description = description;
        if (shortDescription) product.shortDescription = shortDescription;
        if (price) product.price = price;
        if (comparePrice !== undefined) product.comparePrice = comparePrice;
        if (stock !== undefined) product.stock = stock;
        if (category) product.categoryId = category;
        if (images) product.images = images;
        if (isHalal !== undefined) product.isHalal = isHalal;
        if (islamicTags) product.islamicTags = islamicTags;
        if (attributes) product.attributes = attributes;
        // If vendor is editing, set back to pending for re-review
        if (status && ['draft', 'pending'].includes(status)) {
            product.status = status;
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product (Vendor only)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.vendorId !== vendor.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own products'
            });
        }

        await Product.destroy({ where: { id: req.params.id } });

        // Update vendor product count
        await Vendor.update(
            { totalProducts: Math.max(0, vendor.totalProducts - 1) },
            { where: { id: vendor.id } }
        );

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all published products (Public)
// @route   GET /api/products
const getProducts = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 20, sort = '-createdAt',
            category, minPrice, maxPrice,
            search, isHalal, islamicTag, vendor
        } = req.query;

        const where = { status: 'published' };

        if (category) where.categoryId = category;
        if (isHalal) where.isHalal = isHalal === 'true';
        if (islamicTag) where.islamicTags = { [Op.like]: `%${islamicTag}%` };
        if (vendor) where.vendorId = vendor;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = Number(minPrice);
            if (maxPrice) where.price[Op.lte] = Number(maxPrice);
        }
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const sortOrder = sort.startsWith('-')
            ? [[sort.substring(1), 'DESC']]
            : [[sort, 'ASC']];

        const products = await Product.findAll({
            where,
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: Vendor, as: 'vendor', attributes: ['id', 'storeName', 'storeSlug', 'storeLogo', 'averageRating'] }
            ],
            order: sortOrder,
            offset: (page - 1) * limit,
            limit: Number(limit)
        });

        const total = await Product.count({ where });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product (Public)
// @route   GET /api/products/:slug
const getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            where: { slug: req.params.slug, status: 'published' },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: Category, as: 'subcategory', attributes: ['id', 'name', 'slug'] },
                {
                    model: Vendor, as: 'vendor',
                    attributes: ['id', 'storeName', 'storeSlug', 'storeLogo', 'storeDescription', 'averageRating', 'ratingCount', 'contactPhone']
                }
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get related products (same category)
        const relatedProducts = await Product.findAll({
            where: {
                categoryId: product.categoryId,
                id: { [Op.ne]: product.id },
                status: 'published'
            },
            limit: 6,
            attributes: ['id', 'name', 'slug', 'price', 'images', 'averageRating']
        });

        res.status(200).json({
            success: true,
            data: {
                ...product.toJSON(),
                relatedProducts
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get product by ID (for editing)
// @route   GET /api/products/:id/edit
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: Category, as: 'subcategory', attributes: ['id', 'name', 'slug'] }
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if vendor owns this product
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (vendor && product.vendorId !== vendor.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductBySlug,
    getProductById
};