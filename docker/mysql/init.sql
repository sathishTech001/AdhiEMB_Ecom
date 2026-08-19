CREATE DATABASE IF NOT EXISTS adhiemb_db;
GRANT ALL PRIVILEGES ON adhiemb_db.* TO 'adhiemb_user'@'%' IDENTIFIED BY 'adhiemb_password';
FLUSH PRIVILEGES;
