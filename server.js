import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.get('/api/dispensers', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                d.id, d.latitude, d.longitude, d.location_description, d.is_paid, d.price, d.created_at,
                u.username AS added_by_username,
                COALESCE(AVG(r.cleanliness_score), 0) AS avg_cleanliness_score
            FROM dispensers d
            JOIN users u ON d.added_by_user_id = u.id
            LEFT JOIN ratings r ON d.id = r.dispenser_id
            GROUP BY d.id, d.latitude, d.longitude, d.location_description, d.is_paid, d.price, d.created_at, u.username
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/dispensers', async (req, res) => {
    try {
        const { latitude, longitude, description, is_paid, price, user_id } = req.body;
        const { rows } = await pool.query(`
            INSERT INTO dispensers (latitude, longitude, location_description, is_paid, price, added_by_user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [latitude, longitude, description, is_paid, price || 0, user_id]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/dispensers/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
        await pool.query('DELETE FROM ratings WHERE dispenser_id = $1', [id]);
        const result = await pool.query('DELETE FROM dispensers WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Dispenser not found' });
        res.json({ message: 'Dispenser deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/ratings', async (req, res) => {
    try {
        const { dispenser_id, user_id, cleanliness_score, review_text } = req.body;
        const { rows } = await pool.query(`
            INSERT INTO ratings (dispenser_id, user_id, cleanliness_score, review_text)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [dispenser_id, user_id, cleanliness_score, review_text]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/ratings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM ratings WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Rating not found' });
        res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
