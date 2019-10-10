const express = require('express');
const app = express();

//Rutas para acceder desde las api's
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto'));
app.use(require('./upload'));
app.use(require('./imagenes'));
module.exports = app;