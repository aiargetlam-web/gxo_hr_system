-- Database Schema for GXO HR Ticketing & Communication System

CREATE DATABASE IF NOT EXISTS gxo_hr_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gxo_hr_system;

-- --------------------------------------------------------
-- Sites Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS sites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- --------------------------------------------------------
-- Users Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'hr', 'admin') DEFAULT 'user',
    site_id INT, -- Nuovo campo per associare l'utente a un sito
    id_lul VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- HR Sites Assignment (M:N)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS hr_sites (
    hr_id INT NOT NULL,
    site_id INT NOT NULL,
    PRIMARY KEY (hr_id, site_id),
    FOREIGN KEY (hr_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Board Files (Bacheca)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS board_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    hr_author_id INT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hr_author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Board File Sites Visibility (M:N)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS board_file_sites (
    file_id INT NOT NULL,
    site_id INT NOT NULL,
    PRIMARY KEY (file_id, site_id),
    FOREIGN KEY (file_id) REFERENCES board_files(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Import Users Log
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_users_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hr_author_id INT,
    file_name VARCHAR(255) NOT NULL,
    rows_processed INT DEFAULT 0,
    rows_failed INT DEFAULT 0,
    error_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hr_author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Communication Types
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requires_attachment BOOLEAN DEFAULT FALSE,
    default_priority ENUM('low', 'medium', 'high', 'daily', 'weekly', 'monthly') DEFAULT 'medium'
);

-- --------------------------------------------------------
-- Communications
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS communications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type_id INT NOT NULL,
    status ENUM('unread', 'in_progress', 'closed') DEFAULT 'unread',
    priority ENUM('low', 'medium', 'high', 'daily', 'weekly', 'monthly') DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES communication_types(id)
);

-- --------------------------------------------------------
-- Communication Attachments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    communication_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (communication_id) REFERENCES communications(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Communication Messages (Internal Bidirectional)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    communication_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (communication_id) REFERENCES communications(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Ticket Types
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_priority INT DEFAULT 3 -- Scale 1 to 5
);

-- --------------------------------------------------------
-- Tickets
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type_id INT NOT NULL,
    status ENUM('open', 'in_progress', 'waiting', 'closed') DEFAULT 'open',
    priority INT DEFAULT 3, -- Scale 1 to 5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES ticket_types(id)
);

-- --------------------------------------------------------
-- Ticket Messages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Activity Logs (HR/Admin Audit)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- User History Logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_history_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_user_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    modified_by_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (modified_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================================
-- SEED DATA
-- ========================================================

-- Insert Sites
INSERT INTO sites (name) VALUES ('Magazzino Milano'), ('Magazzino Roma'), ('Sede Centrale Bologna');

-- Insert standard users
INSERT INTO users (first_name, last_name, email, password_hash, role, phone, address, site_id, id_lul, is_active) VALUES 
('Mario', 'Rossi', 'mario.rossi@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYm', 'user', '3331234567', 'Via Roma 1, Milano', 1, 'LUL001', TRUE),
('Laura', 'Bianchi', 'hr@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYm', 'hr', '3337654321', 'Via Milano 2, Roma', 2, 'LUL002', TRUE),
('Admin', 'IT', 'admin@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYm', 'admin', '3330000000', 'Sede Centrale', 3, 'LUL000', TRUE);

-- Assegna siti all'HR (Laura gestisce Milano e Roma)
INSERT INTO hr_sites (hr_id, site_id) VALUES (2, 1), (2, 2);

-- Insert Communication Types
INSERT INTO communication_types (name, description, requires_attachment, default_priority) VALUES
('Malattia', 'Comunicazione di assenza per malattia', TRUE, 'daily'),
('Maternità', 'Comunicazione di congedo di maternità', TRUE, 'monthly'),
('Ritardo', 'Avviso di ritardo turno', FALSE, 'daily'),
('Nuovo IBAN', 'Aggiornamento coordinate bancarie', TRUE, 'weekly'),
('Cambio Residenza', 'Aggiornamento indirizzo di residenza', TRUE, 'monthly');

-- Insert Ticket Types
INSERT INTO ticket_types (name, description, default_priority) VALUES
('Problemi Busta Paga', 'Segnalazione anomalie su busta paga mensile', 5),
('Problemi ADP / Badge', 'Problemi con timbrature o badge smarrito', 4),
('Variazione Turno', 'Richiesta di variazione del turno lavorativo', 3),
('Problemi Zucchetti', 'Anomalie nell''accesso al portale HR', 2),
('Altro', 'Altre richieste non categorizzate', 1);

-- Insert Sample Communications
INSERT INTO communications (user_id, type_id, status, priority, notes) VALUES
(1, 1, 'unread', 'daily', 'Assente per influenza, certificato in allegato.'),
(1, 3, 'closed', 'daily', 'Ritardo di 15 minuti per traffico.');

-- Insert Sample Tickets
INSERT INTO tickets (user_id, type_id, status, priority) VALUES
(1, 1, 'open', 5),
(1, 4, 'in_progress', 2);

-- Insert Sample Ticket Messages
INSERT INTO ticket_messages (ticket_id, author_id, content) VALUES
(1, 1, 'La busta paga di questo mese manca del bonus produttività.'),
(1, 2, 'Stiamo verificando con il consulente del lavoro, ti facciamo sapere al più presto.');

-- Insert Board File (Bacheca)
INSERT INTO board_files (file_name, file_path, hr_author_id) VALUES ('Regolamento_Aziendale_2026.pdf', 'uploads/Regolamento_Aziendale_2026.pdf', 2);
-- Make the file visible to Milano and Roma
INSERT INTO board_file_sites (file_id, site_id) VALUES (1, 1), (1, 2);
