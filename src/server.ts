import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { UPLOAD_DIR } from './config/uploads';
import { giftRoutes } from './routes/giftRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', immutable: true }));
app.use('/api', giftRoutes);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`http://localhost:${port}`));

app.get('/health', (_req, res) => {
    res.status(200).send('ok');
});


