import { pool } from '../config/db';
import { AdminGift, GuestGift, NewGift } from '../models/gift';

export const giftRepository = {
    async findVisibleForGuest(token: string): Promise<GuestGift[]> {
        const { rows } = await pool.query(
            `SELECT id, name, emoji, description, image_url AS "imageUrl",
                    COALESCE(claimed_by = $1, false) AS mine
             FROM gifts
             WHERE claimed_by IS NULL OR claimed_by = $1
             ORDER BY created_at`,
            [token]
        );
        return rows;
    },
    async updateDescription(id: number, description: string | null): Promise<AdminGift | null> {
        const { rows } = await pool.query(
            `UPDATE gifts SET description = $2 WHERE id = $1
       RETURNING id, name, emoji, description, image_url AS "imageUrl",
                 (claimed_by IS NOT NULL) AS claimed`,
            [id, description]
        );
        return rows[0] ?? null;
    },

    async findAllForAdmin(): Promise<AdminGift[]> {
        const { rows } = await pool.query(
            `SELECT id, name, emoji, description, image_url AS "imageUrl",
                    (claimed_by IS NOT NULL) AS claimed
             FROM gifts
             ORDER BY created_at`
        );
        return rows;
    },

    async insert(gift: NewGift): Promise<AdminGift> {
        const { rows } = await pool.query(
            `INSERT INTO gifts (name, emoji, description, image_url)
             VALUES ($1, COALESCE(NULLIF($2, ''), '🎁'), $3, $4)
                 RETURNING id, name, emoji, description, image_url AS "imageUrl", false AS claimed`,
            [gift.name, gift.emoji ?? '', gift.description ?? null, gift.imageUrl ?? null]
        );
        return rows[0];
    },

    async claim(id: number, token: string): Promise<'ok' | 'taken' | 'limit'> {
        try {
            const { rowCount } = await pool.query(
                `UPDATE gifts SET claimed_by = $2, claimed_at = now()
         WHERE id = $1 AND claimed_by IS NULL`,
                [id, token]
            );
            return (rowCount ?? 0) > 0 ? 'ok' : 'taken';
        } catch (e) {
            if ((e as { code?: string }).code === '23505') return 'limit';
            throw e;
        }
    },

    async release(id: number, token: string): Promise<boolean> {
        const { rowCount } = await pool.query(
            `UPDATE gifts SET claimed_by = NULL, claimed_at = NULL
             WHERE id = $1 AND claimed_by = $2`,
            [id, token]
        );
        return (rowCount ?? 0) > 0;
    },

    async deleteById(id: number): Promise<{ imageUrl: string | null } | null> {
        const { rows } = await pool.query(
            'DELETE FROM gifts WHERE id = $1 RETURNING image_url AS "imageUrl"',
            [id]
        );
        return rows[0] ?? null;
    },
};