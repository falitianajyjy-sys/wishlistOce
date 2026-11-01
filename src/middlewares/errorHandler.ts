import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../errors/AppError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message });
    }
    if (err instanceof multer.MulterError) {
        const msg =
            err.code === 'LIMIT_FILE_SIZE' ? 'Photo trop lourde (5 Mo maximum)' : 'Envoi invalide';
        return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: msg });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
}