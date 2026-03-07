CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dispensers (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    location_description TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    price DECIMAL DEFAULT 0,
    added_by_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    dispenser_id INTEGER REFERENCES dispensers(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    cleanliness_score INTEGER CHECK (cleanliness_score >= 1 AND cleanliness_score <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username) VALUES
('water_lover99'),
('hydro_homie'),
('city_walker'),
('eco_warrior'),
('thirst_quencher');

INSERT INTO dispensers (latitude, longitude, location_description, is_paid, price, added_by_user_id) VALUES
(40.7128, -74.0060, 'Central Park near the main entrance', FALSE, 0, 1),
(40.7138, -74.0070, 'Inside the public library, 1st floor', FALSE, 0, 2),
(40.7148, -74.0080, 'Subway station platform 2', TRUE, 1.50, 3),
(40.7158, -74.0090, 'Community center gym', FALSE, 0, 4),
(40.7168, -74.0100, 'Shopping mall food court', TRUE, 2.00, 5);

INSERT INTO ratings (dispenser_id, user_id, cleanliness_score, review_text) VALUES
(1, 2, 5, 'Very clean and cold water!'),
(2, 3, 4, 'Good, but sometimes has a line.'),
(3, 4, 2, 'A bit dirty, needs maintenance.'),
(4, 5, 5, 'Perfect, always working.'),
(5, 1, 3, 'Average, water is not very cold.');
