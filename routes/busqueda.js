var express = require('express');

// Inicializar variables
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// =====================================
// Busqueda por colección
// =====================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'medico':
            promesa = buscarMedicos(busqueda, regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }
            });
            break;
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });



});

// =====================================
// Busqueda general
// =====================================
app.get('/all/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });



});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email ')
            .exec((error, hospitales) => {

                if (error) {
                    reject('error al cargar hospitales');
                } else {
                    resolve(hospitales)
                }

            });

    });
}


function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email ')
            .populate('hospital')
            .exec((error, medicos) => {

                if (error) {
                    reject('error al cargar medicos');
                } else {
                    resolve(medicos);
                }

            });

    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuario');
                } else {
                    resolve(usuarios);
                }

            })

    });
}

module.exports = app;