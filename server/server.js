require('./config/config');
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

//get para consultar
app.get('/usuario', function(req, res) {
    res.json('get Usuario')
})

//post para agregar datos
app.post('/usuario', function(req, res) {

    let body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'Se nececita el nombre de la persoan'
        });
    } else {
        res.json({
            persona: body
        });
    }
})

//put para actualizar datos
app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    res.json({
        id
    })
})

//put para actualizar el estado de los datos
app.delete('/usuario', function(req, res) {
    res.json('delete Usuario')
})

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto', process.env.PORT);
})