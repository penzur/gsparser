-- Migration number: 0000 	 2023-06-27T02:15:53.368Z
-- Description: Initial Migration
CREATE TABLE IF NOT EXISTS servers (
	id VARCHAR(100) PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	private BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS logs (
	hash TEXT NOT NULL UNIQUE,
	server VARCHAR(100) NOT NULL REFERENCES servers (id) ON DELETE CASCADE,
	date BIGINT NOT NULL,
	guilds TEXT NOT NULL,
	players TEXT NOT NULL,
	PRIMARY KEY (server, date)
);
CREATE INDEX IF NOT EXISTS logs_server_idx ON logs (server);
CREATE INDEX IF NOT EXISTS logs_date_idx ON logs (date);
