const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('..//models/usuario');
const Producto = require('..//models/producto');
const fs = require('fs');
const path = require('path');

app.use(fileUpload({ useTempFiles: true }));

//Servicio para cargar imagenes de usuarios y productos
app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({ ok: false, err: { message: 'No se ha seleccionado ninguna imagen' } });
    }

    //Valida tipo de imagen
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({ ok: false, err: { message: 'Los tipos validos son ' + tiposValidos.join(',') } });
    }

    let archivo = req.files.archivo;
    let nombreCorto = archivo.name.split('.');
    let extension = nombreCorto[nombreCorto.length - 1];

    //Valida si la extension del archivo es permitida
    let extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extencionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({ ok: false, err: { message: 'Las extensiones permitidas son ' + extencionesValidas.join(',') } });
    }


    //Cambiar nombre del archivo
    let nombreAchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    archivo.mv(`uploads/${tipo}/${nombreAchivo}`, (err) => {

        if (err) {
            return res.status(500).json({ ok: false, err });
        }
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreAchivo);
        } else {
            imagenProducto(id, res, nombreAchivo);
        }

    });
});

//Guarda la imagen del usuario
function imagenUsuario(id, res, nombreAchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreAchivo, 'usuarios');
            return res.status(500).json({ ok: false, err });
        }
        if (!usuarioDB) {
            borraArchivo(nombreAchivo, 'usuarios');
            return res.status(400).json({ ok: false, err: { message: 'El usuario no existe' } });
        }

        borraArchivo(usuarioDB.img, 'usuarios');
        usuarioDB.img = nombreAchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({ ok: true, usuario: usuarioGuardado, img: nombreAchivo });
        })
    });

}

//Guarda la imagen del producto
function imagenProducto(id, res, nombreAchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreAchivo, 'productos');
            return res.status(500).json({ ok: false, err });
        }
        if (!productoDB) {
            borraArchivo(nombreAchivo, 'productos');
            return res.status(400).json({ ok: false, err: { message: 'El producto no existe' } });
        }

        borraArchivo(productoDB.img, 'productos');
        productoDB.img = nombreAchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({ ok: true, producto: productoGuardado, img: nombreAchivo });
        })
    });
}


//Si la imagen ya existe, la elimina
function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}
module.exports = app;