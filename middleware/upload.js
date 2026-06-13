const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';

        // Categorize uploads
        if (file.fieldname === 'avatar') {
            uploadPath += 'avatars';
        } else if (file.fieldname === 'storeLogo' || file.fieldname === 'storeBanner') {
            uploadPath += 'stores';
        } else if (file.fieldname === 'productImages') {
            uploadPath += 'products';
        } else if (file.fieldname === 'certificate') {
            uploadPath += 'certificates';
        } else if (file.fieldname === 'document') {
            uploadPath += 'documents';
        } else {
            uploadPath += 'misc';
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = `${uuidv4()}${ext}`;
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC) are allowed'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter
});

module.exports = upload;