import fs from 'node:fs/promises';
import path from 'node:path';

import { UPLOAD_DIR } from '../config/uploads';
import { AppError } from '../errors/AppError';
import { AdminGift, GuestGift, NewGift } from '../models/gift';
import { giftRepository } from '../repositories/giftRepository';

function checkToken(token: unknown): string {
    if (typeof token !== 'string' || token.length < 8) {
        throw new AppError(400, 'Identifiant invité invalide');
    }
    return token;
}

function checkId(id: unknown): number {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) throw new AppError(400, 'Identifiant invalide');
    return n;
}

async function removeFile(imageUrl: string | null | undefined) {
    if (!imageUrl) return;
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(imageUrl))).catch(() => {});
}

export const giftService = {
    listForGuest(token: unknown): Promise<GuestGift[]> {
        return giftRepository.findVisibleForGuest(typeof token === 'string' ? token : '');
    },

    listForAdmin(): Promise<AdminGift[]> {
        return giftRepository.findAllForAdmin();
    },

    async create(input: Partial<NewGift>, file?: Express.Multer.File): Promise<AdminGift> {
        const imageUrl = file ? `/uploads/${file.filename}` : null;
        try {
            const name = String(input.name ?? '').trim();
            if (!name) throw new AppError(400, 'Nom requis');
            if (name.length > 120) throw new AppError(400, 'Nom trop long');
            const description = input.description ? String(input.description).trim() : null;
            if (description && description.length > 500) {
                throw new AppError(400, 'Description trop longue');
            }
            return await giftRepository.insert({
                name,
                emoji: input.emoji ? String(input.emoji).trim().slice(0, 8) : '',
                description,
                imageUrl,
            });
        } catch (e) {
            await removeFile(imageUrl);
            throw e;
        }
    },

    async claim(id: unknown, token: unknown): Promise<void> {
        const result = await giftRepository.claim(checkId(id), checkToken(token));
        if (result === 'limit') {
            throw new AppError(409, 'Tu as déjà choisi un cadeau. Annule-le pour en choisir un autre.');
        }
        if (result === 'taken') throw new AppError(409, 'Ce cadeau vient d’être pris');
    },

    async release(id: unknown, token: unknown): Promise<void> {
        await giftRepository.release(checkId(id), checkToken(token));
    },

    async remove(id: unknown): Promise<void> {
        const deleted = await giftRepository.deleteById(checkId(id));
        if (!deleted) throw new AppError(404, 'Cadeau introuvable');
        await removeFile(deleted.imageUrl);
    },
    async updateDescription(id: unknown, description: unknown): Promise<AdminGift> {
        const text = description == null ? '' : String(description).trim();
        if (text.length > 500) throw new AppError(400, 'Description trop longue');
        const gift = await giftRepository.updateDescription(checkId(id), text || null);
        if (!gift) throw new AppError(404, 'Cadeau introuvable');
        return gift;
    },
};