/** BizTime express application. */

const express = require("express");
const app = express();

const ExpressError = require("./utils/expressError");
const cRoutes = require('./routes/companies');
const iRoutes = require('./routes/invoices');
const indRoutes = require('./routes/industries');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/companies', cRoutes);
app.use('/invoices', iRoutes);
app.use('/industries', indRoutes);

/** 404 handler */
app.use((req, res, next) => {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
