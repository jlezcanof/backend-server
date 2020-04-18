var express = require('express');
var bcrypt = require('bcryptjs');
//var jwt = require('jsonwebtoken');

//var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middleware/autenticacion');


var app = express();

var Usuario = require('../models/usuario');

//==========================================
// Obtener todos los usuarios
//==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    })

                });


            })

});




//==========================================
// Actualizar usuario
//==========================================
app.put('/:id', [mdAutenticacion.verificaToken,
    mdAutenticacion.verificaAdminOMismoUsuario
], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        // ini añadido 31 marzo 2020
        if (!usuario.google) { // this.usuario.google
            usuario.email = body.email;
        }
        // end añadido 31 marzo 2020

        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});


//==========================================
// Crear un nuevo usuario
//==========================================
app.post('/', /*mdAutenticacion.verificaToken,*/ (req, res) => {


    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        /*var hash = bcrypt.hashSync("B4c0/\/", salt);
         */
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    });

});

//==========================================
// Borrar un usuario por id 
//==========================================
app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaRoleAdmin], (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: { message: 'No existe usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});



module.exports = app;