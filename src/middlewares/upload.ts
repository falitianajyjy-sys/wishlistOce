import multer from 'multer';
import { AppError } from '../errors/AppError';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED.has(file.mimetype)) return cb(null, true);
        cb(new AppError(400, 'Format non supporté (JPG, PNG, WEBP ou GIF)'));
    },
});