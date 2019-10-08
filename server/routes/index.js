const express = require('express');
const app = express();

//Rutas para acceder desde las api's
app.use(require('./usuario'));
app.use(require('./login'));

module.exports = app;