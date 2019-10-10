const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

//get para consultar
app.get('/usuario', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);

    Usuario.find({}, 'nombre precioUni descripcion categoria usuario disponible')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({ ok: false, err });
            }

            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({ ok: true, usuarios, cuantos: conteo });
            });
        });
});

//post para agregar datos
app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({ ok: false, err })
        }

        //usuarioDB.password = null;
        res.json({ ok: true, usuario: usuarioDB })
    });

})

//put para actualizar datos
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.id;

    //Solo envia los campos que quiero actualizar en el put
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({ ok: false, err });
        }
        res.json({ ok: true, usuario: usuarioDB });
    })
})

//Delete para eliminar datos
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    //Para eliminar el usuario de la base de datos
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaEstado = {
        estado: false
    };
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({ ok: false, err });
        };

        if (!usuarioBorrado) {
            return res.status(400).json({ ok: false, err: { message: 'El usuario esta inactivo' } });
        }
        res.json({ ok: true, usuario: usuarioBorrado });
    });

});

module.exports = app;