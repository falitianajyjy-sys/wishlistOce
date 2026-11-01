import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { UPLOAD_DIR } from '../config/uploads';
import { AppError } from '../errors/AppError';

const EXT: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

export const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
        filename: (_req, file, cb) => cb(null, randomUUID() + EXT[file.mimetype]),
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (EXT[file.mimetype]) return cb(null, true);
        cb(new AppError(400, 'Format non supporté (JPG, PNG, WEBP ou GIF)'));
    },
});