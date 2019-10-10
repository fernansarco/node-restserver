const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');
const _ = require('underscore');

//Servicio que crea un nuevo  producto
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        disponible: body.disponible,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({ ok: false, err });
        }
        if (!productoDB) {
            return res.status(400).json({ ok: false, err });
        }

        res.json({ ok: true, producto: productoDB });
    })

});

//Servicio para actualizar un producto por el ID
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    //Muestra los campos que quiero actualizar
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoria', 'disponible']);


    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({ ok: false, err });
        }
        res.json({ ok: true, producto: productoDB });
    })

});


//Servicio para deshabilitar el estado de un producto
app.delete('/producto/:id', verificaToken, function(req, res) {

    let id = req.params.id;

    //Para eliminar el usuario de la base de datos
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaEstado = {
        disponible: false
    };
    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({ ok: false, err });
        };

        if (!productoBorrado) {
            return res.status(400).json({ ok: false, err: { message: 'El producto esta indisponible' } });
        }
        res.json({ ok: true, producto: productoBorrado });
    });

});

//Servicio que muestra producto por ID
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({ ok: false, err });
            }
            if (!productoDB) {
                return res.status(400).json({ ok: false, err: { message: 'El id no existe' } });
            }

            res.json({ ok: true, producto: productoDB });

        })

});


//Servicio que lista productos
app.get('/producto', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);
    Producto.find({}, 'nombre precioUni descripcion categoria usuario disponible')
        .skip(desde)
        .limit(limite)
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({ ok: false, err });
            }
            res.json({ ok: true, productos })
        })

});


//Servicio que para buscar un  producto
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i')
    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({ ok: false, err });
            }
            res.json({ ok: true, productos })
        })

});

module.exports = app;