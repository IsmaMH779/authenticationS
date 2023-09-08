create database proyecto;
use proyecto;

CREATE TABLE IF NOT EXISTS users (
user_id INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(255) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
password CHAR(64) NOT NULL,
registered datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
last_login datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);

select * from users;

