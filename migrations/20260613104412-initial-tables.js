'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ========== 1. CREATE USERS TABLE ==========
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('customer', 'vendor', 'admin'),
        defaultValue: 'customer'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      avatar: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      shippingAddresses: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // ========== 2. CREATE VENDORS TABLE ==========
    await queryInterface.createTable('Vendors', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      storeName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      storeSlug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      storeDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      storeLogo: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      storeBanner: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      contactEmail: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contactPhone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isHalalCertified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      halalCertificateUrl: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      complianceStatus: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'suspended'),
        defaultValue: 'pending'
      },
      verificationStatus: {
        type: Sequelize.ENUM('unverified', 'pending', 'verified', 'rejected'),
        defaultValue: 'unverified'
      },
      verificationDocuments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      businessRegistrationNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      specialties: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      paymentInfo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      commissionRate: {
        type: Sequelize.FLOAT,
        defaultValue: 5
      },
      totalSales: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      totalProducts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      averageRating: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      ratingCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // ========== 3. CREATE CATEGORIES TABLE ==========
    await queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      image: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: { model: 'Categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      islamicType: {
        type: Sequelize.ENUM(
          'Clothing_&_Modest_Fashion', 'Prayer_&_Worship', 'Quran_&_Islamic_Knowledge',
          'Halal_Food_&_Beverages', 'Home_&_Lifestyle', 'Personal_Care_&_Fragrance',
          'Gifts_&_Occasions', 'Digital_&_Media', 'Children_&_Family',
          'Hajj_&_Umrah', 'Other'
        ),
        defaultValue: 'Other'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // ========== 4. CREATE PRODUCTS TABLE ==========
    await queryInterface.createTable('Products', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Vendors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      shortDescription: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subcategory_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      comparePrice: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      costPrice: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      discount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lowStockThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      images: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      videoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isHalal: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      halalCertification: {
        type: Sequelize.STRING,
        allowNull: true
      },
      islamicTags: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attributes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      dimensions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isFreeShipping: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      shippingPrice: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending', 'published', 'rejected', 'archived'),
        defaultValue: 'draft'
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      totalSold: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      averageRating: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      ratingCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // ========== 5. CREATE CARTS TABLE ==========
    await queryInterface.createTable('Carts', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      items: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      subtotal: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      shippingCost: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      tax: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      total: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      couponCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      discountAmount: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // ========== 6. CREATE ORDERS TABLE ==========
    await queryInterface.createTable('Orders', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      items: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      shippingAddress: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      subtotal: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      shippingCost: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      tax: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      discount: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      total: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.ENUM('pay_on_delivery', 'card', 'bank_transfer', 'paystack', 'flutterwave'),
        defaultValue: 'pay_on_delivery'
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      paymentReference: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
      },
      trackingNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estimatedDelivery: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      refundAmount: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      refundedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // ========== 7. CREATE REVIEWS TABLE ==========
    await queryInterface.createTable('Reviews', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Vendors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      images: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isVerifiedPurchase: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      adminReply: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      vendorReply: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // ========== 8. ADD INDEXES ==========
    // Unique index on Reviews (user_id, product_id)
    await queryInterface.addIndex('Reviews', ['user_id', 'product_id'], {
      unique: true,
      name: 'reviews_user_id_product_id'
    });

    // Index for Products
    await queryInterface.addIndex('Products', ['vendor_id', 'status']);
    await queryInterface.addIndex('Products', ['category_id', 'status']);
    await queryInterface.addIndex('Products', ['price']);
    await queryInterface.addIndex('Products', ['averageRating']);
    await queryInterface.addIndex('Products', ['createdAt']);

    // Index for Orders
    await queryInterface.addIndex('Orders', ['user_id', 'createdAt']);
    await queryInterface.addIndex('Orders', ['orderNumber']);
    await queryInterface.addIndex('Orders', ['status']);
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order (dependants first)
    await queryInterface.dropTable('Reviews');
    await queryInterface.dropTable('Orders');
    await queryInterface.dropTable('Carts');
    await queryInterface.dropTable('Products');
    await queryInterface.dropTable('Categories');
    await queryInterface.dropTable('Vendors');
    await queryInterface.dropTable('Users');
  }
};