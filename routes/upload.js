var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

// Inicializar variables
var app = express();


var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var extension = archivo.name.split('.');
    extension = extension[extension.length - 1];

    //Solo aceptamos estas extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //sino lo encuentra
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    // id-random.extension
    // ejemplo: 245254343545-4545.png
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });

        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    })






});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    //sacar la respuesta en formato json

    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no existe',
                        errors: { message: 'Usuario no existe' }
                    });
                }

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        errors: err
                    });
                }



                var pathViejo = './uploads/usuarios/' + usuario.img;

                // si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, err => {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al eliminar imagen anterior'
                            });
                        }
                    });
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {

                    usuarioActualizado.password = ':)';

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });

                })

            });
            break;

        case 'medicos':
            Medico.findById(id, (err, medico) => {

                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Medico no existe',
                        errors: { message: 'Medico no existe' }
                    });
                }

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar medico',
                        errors: err
                    });
                }

                var pathViejo = './uploads/medicos/' + medico.img;

                // si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, err => {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al eliminar imagen anterior'
                            });
                        }
                    });
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });

                })

            });
            break;

        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {


                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Hospital no existe',
                        errors: { message: 'Hospital no existe' }
                    });
                }

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar hospital',
                        errors: err
                    });
                }

                var pathViejo = './uploads/hospitales/' + hospital.img;

                // si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, err => {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al eliminar imagen anterior'
                            });
                        }
                    });
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hosital: hospitalActualizado
                    });

                })

            });
            break;

        default:
            break;
    }

}


module.exports = app;