const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

//Import routes
const listingRouter = require('./routes/listings');
const userRouter = require('./routes/users');
const bookingRouter = require('./routes/bookings');

const server = express();

server.use(cors());
server.use(express.json());
server.use(morgan('combined'));

// server.use((req, res) => {
//   console.log(req.method, req.path);
//   res
//     .status(503)
//     .json({ error: 'Site is down for maintenance, check back soon.' });
// });

server.use(listingRouter);
server.use(userRouter);
server.use(bookingRouter);

module.exports = server;
