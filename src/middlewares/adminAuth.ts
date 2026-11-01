import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

export function adminAuth(req: Request, _res: Response, next: NextFunction) {
    if (req.header('x-admin-token') !== process.env.ADMIN_TOKEN) {
        return next(new AppError(401, 'Non autorisé'));
    }
    next();
}