const dotenv = require('dotenv');
dotenv.config();

const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'hayaa_ecommerce',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        // Try to create the database if it doesn't exist (may fail on some hosts, that's ok)
        try {
            const conn = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || ''
            });
            await conn.execute(
                `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'hayaa_ecommerce'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
            );
            await conn.end();
        } catch (dbCreateErr) {
            // Database may already exist or user lacks CREATE privilege - continue
            console.log('Note: Could not auto-create database (may already exist). Continuing...');
        }

        // Connect to the actual database
        await sequelize.authenticate();
        console.log(`MySQL Connected: ${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'hayaa_ecommerce'}`);

        // Note: Tables are managed via migrations!
        // Run: npm run migrate
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };