import { pool } from '../config/db';
import { AdminGift, GuestGift, NewGift } from '../models/gift';

const IMAGE_URL = `CASE WHEN image_data IS NOT NULL
                   THEN '/api/gifts/' || id || '/image' END`;

export const giftRepository = {
    async findVisibleForGuest(token: string): Promise<GuestGift[]> {
        const { rows } = await pool.query(
            `SELECT id, name, emoji, description, ${IMAGE_URL} AS "imageUrl",
              COALESCE(claimed_by = $1, false) AS mine
       FROM gifts
       WHERE claimed_by IS NULL OR claimed_by = $1
       ORDER BY created_at`,
            [token]
        );
        return rows;
    },

    async findAllForAdmin(): Promise<AdminGift[]> {
        const { rows } = await pool.query(
            `SELECT id, name, emoji, description, ${IMAGE_URL} AS "imageUrl",
              (claimed_by IS NOT NULL) AS claimed
       FROM gifts
       ORDER BY created_at`
        );
        return rows;
    },

    async findImage(id: number): Promise<{ data: Buffer; type: string } | null> {
        const { rows } = await pool.query(
            'SELECT image_data AS data, image_type AS type FROM gifts WHERE id = $1 AND image_data IS NOT NULL',
            [id]
        );
        return rows[0] ?? null;
    },

    async insert(gift: NewGift): Promise<AdminGift> {
        const { rows } = await pool.query(
            `INSERT INTO gifts (name, emoji, description, image_data, image_type)
       VALUES ($1, COALESCE(NULLIF($2, ''), '🎁'), $3, $4, $5)
       RETURNING id, name, emoji, description, ${IMAGE_URL} AS "imageUrl", false AS claimed`,
            [
                gift.name,
                gift.emoji ?? '',
                gift.description ?? null,
                gift.image?.data ?? null,
                gift.image?.type ?? null,
            ]
        );
        return rows[0];
    },

    async updateDescription(id: number, description: string | null): Promise<AdminGift | null> {
        const { rows } = await pool.query(
            `UPDATE gifts SET description = $2 WHERE id = $1
       RETURNING id, name, emoji, description, ${IMAGE_URL} AS "imageUrl",
                 (claimed_by IS NOT NULL) AS claimed`,
            [id, description]
        );
        return rows[0] ?? null;
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

    async deleteById(id: number): Promise<boolean> {
        const { rowCount } = await pool.query('DELETE FROM gifts WHERE id = $1', [id]);
        return (rowCount ?? 0) > 0;
    },
};