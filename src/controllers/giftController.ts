import { NextFunction, Request, RequestHandler, Response } from 'express';
import { giftService } from '../services/giftService';

const wrap =
    (fn: (req: Request, res: Response) => Promise<void>): RequestHandler =>
        (req: Request, res: Response, next: NextFunction) => {
            fn(req, res).catch(next);
        };

export const giftController = {
    listForGuest: wrap(async (req, res) => {
        res.json(await giftService.listForGuest(req.query.me));
    }),

    claim: wrap(async (req, res) => {
        await giftService.claim(req.params.id, req.body?.token);
        res.json({ ok: true });
    }),

    release: wrap(async (req, res) => {
        await giftService.release(req.params.id, req.body?.token);
        res.json({ ok: true });
    }),

    listForAdmin: wrap(async (_req, res) => {
        res.json(await giftService.listForAdmin());
    }),

    create: wrap(async (req, res) => {
        res.status(201).json(await giftService.create(req.body ?? {}, req.file));
    }),

    remove: wrap(async (req, res) => {
        await giftService.remove(req.params.id);
        res.json({ ok: true });
    }),
    updateDescription: wrap(async (req, res) => {
        res.json(await giftService.updateDescription(req.params.id, req.body?.description));
    }),

};