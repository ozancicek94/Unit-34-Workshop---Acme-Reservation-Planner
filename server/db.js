//import the packages

const pg = require('pg');
const express = require('express');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost/acme_reservation_planner");
const {v4: uuid} = require('uuid');

//create tables for customers, restaurant, and reservations

const createTables = async() => {

  let SQL = `
  DROP TABLE IF EXISTS reservations;
  DROP TABLE IF EXISTS customers;
  DROP TABLE IF EXISTS restaurants;

  CREATE TABLE customers(
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL
  );

  CREATE TABLE restaurants(
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL
  );

  CREATE TABLE reservations(
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  party_count INTEGER NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL
  );
  `;

  await client.query(SQL);

};

// create methods to create customers and restaurants

const createCustomer = async({name}) => {

  const SQL = `
  INSERT INTO customers(id, name) VALUES ($1, $2) RETURNING *
  `;

  const response = await client.query(SQL, [uuid(), name]);

  return response.rows[0];

};

const createRestaurant = async({name}) => {

  const SQL = `
  INSERT INTO restaurants (id, name) VALUES ($1, $2) RETURNING *
  `;

  const response = await client.query(SQL, [uuid(), name]);

  return response.rows[0];

};



//create methods to create reservations and fetch reservations

const fetchCustomers = async() => {

  const SQL = `
  SELECT * FROM customers
  `;

  const response = await client.query(SQL);

  return response.rows;

};

const fetchRestaurants = async() => {

  const SQL = `
  SELECT * FROM restaurants
  `;

  const response = await client.query(SQL);

  return response.rows;

};

// create methods to create and fetch reservations

const createReservation = async({date, party_count, restaurant_id, customer_id}) => {

  const SQL = `
  INSERT INTO reservations (id, date, party_count, restaurant_id, customer_id) VALUES ($1, $2, $3, $4, $5)
  RETURNING *
  `;

  const response = await client.query(SQL, [uuid(), date, party_count, restaurant_id, customer_id ]);

  return response.rows[0];

};

const fetchReservations = async() => {

  const SQL = `SELECT * FROM reservations`;

  const response = await client.query(SQL)

  return response.rows;

};

//create a destroyReservation method

const destroyReservation = async({id, customer_id}) => {

  console.log(id, customer_id);

  const SQL = `
  DELETE FROM reservations
  WHERE id=$1 AND customer_id=$2
  `;

  await client.query(SQL, [id, customer_id]);

};

//export the modules

module.exports = {
  client, 
  createTables,
  createCustomer,
  createRestaurant, 
  createReservation,
  fetchCustomers,
  fetchRestaurants, 
  fetchReservations,
  destroyReservation
};