const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    let errors = [];

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        message = 'Validation failed';
        if (err.errors) {
            errors = err.errors.map(e => ({
                field: e.path,
                message: e.message
            }));
        }
    }

    // Sequelize foreign key error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        message = 'Referenced record not found';
    }

    // Sequelize database error
    if (err.name === 'SequelizeDatabaseError') {
        statusCode = 400;
        message = err.message;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    }

    // Generic error
    res.status(statusCode).json({
        success: false,
        message,
        errors: errors.length > 0 ? errors : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;