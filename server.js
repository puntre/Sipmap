import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = newDb();
const { Pool } = db.adapters.createPg();
const pool = new Pool();

const initSql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
db.public.none(initSql);

app.get('/api/dispensers', async (req, res) => {
    try {
        const query = `
            SELECT 
                d.id, d.latitude, d.longitude, d.location_description, d.is_paid, d.price, d.created_at,
                u.username AS added_by_username,
                COALESCE(AVG(r.cleanliness_score), 0) AS avg_cleanliness_score
            FROM dispensers d
            JOIN users u ON d.added_by_user_id = u.id
            LEFT JOIN ratings r ON d.id = r.dispenser_id
            GROUP BY d.id, d.latitude, d.longitude, d.location_description, d.is_paid, d.price, d.created_at, u.username
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching dispensers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/dispensers', async (req, res) => {
    try {
        const { latitude, longitude, description, is_paid, price, user_id } = req.body;
        const query = `
            INSERT INTO dispensers (latitude, longitude, location_description, is_paid, price, added_by_user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [latitude, longitude, description, is_paid, price || 0, user_id];
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error adding dispenser:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/dispensers/:id', async (req, res) => {
    try {
        const dispenserId = parseInt(req.params.id);
        if (isNaN(dispenserId)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        console.log(`Server: Deleting dispenser ${dispenserId}`);

        await pool.query('DELETE FROM ratings WHERE dispenser_id = $1', [dispenserId]);

        const result = await pool.query('DELETE FROM dispensers WHERE id = $1', [dispenserId]);
        
        if (result.rowCount === 0) {
            console.log(`Server: Dispenser ${dispenserId} not found`);
            return res.status(404).json({ error: 'Dispenser not found' });
        }
        
        console.log(`Server: Successfully deleted dispenser ${dispenserId}`);
        res.json({ message: 'Dispenser deleted successfully' });
    } catch (error) {
        console.error('Error deleting dispenser:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/ratings', async (req, res) => {
    try {
        const { dispenser_id, user_id, cleanliness_score, review_text } = req.body;
        const query = `
            INSERT INTO ratings (dispenser_id, user_id, cleanliness_score, review_text)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [dispenser_id, user_id, cleanliness_score, review_text];
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/ratings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `DELETE FROM ratings WHERE id = $1 RETURNING *`;
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        res.json({ message: 'Rating deleted successfully', deletedRating: rows[0] });
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
