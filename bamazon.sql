DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

DROP TABLE IF EXISTS products;
CREATE TABLE products (
  item_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(50) NULL,
  product_sales DECIMAL(13,4) DEFAULT 0,
  price DECIMAL(13,4) NULL,
  stock_quantity INT DEFAULT 0,
  PRIMARY KEY (item_id)
);

DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
	department_id INT AUTO_INCREMENT NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  over_head_costs DECIMAL(13,4),
  PRIMARY KEY(department_id)
);