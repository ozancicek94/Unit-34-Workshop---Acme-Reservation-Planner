// import the modules

const {
  client, 
  createTables,
  createCustomer,
  createRestaurant, 
  createReservation,
  fetchCustomers,
  fetchRestaurants, 
  fetchReservations,
  destroyReservation
} = require('./db.js');

const express = require('express');
const app = express();

// parse the incoming requests from JSON

app.use(express.json());

// app routes here

app.get('/api/customers', async(req,res,next) => {
  try{

    res.send( await fetchCustomers());

  } catch(error) {next(error)};

});

app.get('/api/restaurants', async(req,res,next) => {
  try{

    res.send(await fetchRestaurants());

  } catch(error){next(error)};

});

app.get('/api/reservations', async(req,res,next) => {
  try{

    res.send(await fetchReservations());

  } catch(error){next(error)};

});

app.post('/api/customers/:customer_id/reservations', async(req,res,next) => {
  try{

    res.status(201).send(await createReservation({customer_id: req.params.customer_id, restaurant_id: req.body.restaurant_id, date: req.body.date, party_count: req.body.party_count}));

  } catch(error){next(error)}
});

app.delete('/api/customers/:customer_id/reservations/:id', async(req,res,next) => {
  try{

    await destroyReservation({customer_id: req.params.customer_id, id: req.params.id});

    res.sendStatus(204);

  } catch(error) {next(error)};
});

//create the init function

const init = async() => {

  console.log("Connecting to the database");
  await client.connect();
  console.log("Connected to the database");

  await createTables();
  console.log("Tables have been created");

  const [Ozan, Mariana, Burak, Doruk, Eda, Bhende, Badmaash, Mhzh, Crackshack, Elephante] = await Promise.all([
    createCustomer({name:'Ozan'}),
    createCustomer({name:'Mariana'}),
    createCustomer({name:'Burak'}),
    createCustomer({name:'Bhende'}),
    createCustomer({name:'Doruk'}),
    createCustomer({name:'Eda'}),

    createRestaurant({name:'Badmaash'}),
    createRestaurant({name:'Mhzh'}),
    createRestaurant({name:'Crackshack'}),
    createRestaurant({name:'Elephante'})
  ]);

  console.log( await fetchCustomers());
  console.log( await fetchRestaurants());

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      date: '2026-02-25',
      party_count: 2,
      restaurant_id: Elephante.id,
      customer_id: Burak.id
    }),

    createReservation({
      date: '2026-05-14',
      party_count: 2,
      restaurant_id: Badmaash.id,
      customer_id: Ozan.id
    })
  ]);

  console.log(await fetchReservations());

  await destroyReservation({id: reservation.id, customer_id: reservation.customer_id });

  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  })

};

//call the init function

init();

