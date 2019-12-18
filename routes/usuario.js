var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middleware/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// Rutas
// ====================================================
// Obtener todos los usuarios
// ====================================================
app.get('/', (req, res, next) => {
	Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error cargando Usuarios',
				errors: err,
			});
		}

		res.status(200).json({
			ok: true,
			usuarios: usuarios,
		});
	});
});


// ====================================================
// Actualizar un nuevo Usuario
// ====================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
	var id = req.params.id;
	var body = req.body;

	Usuario.findById(id, (err, usuario) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar Usuarios',
				errors: err,
			});
		}

		if (!usuario) {
			return res.status(400).json({
				ok: false,
				mensaje: 'EL usuario con el id: ' + id + ' no existe.',
				errors: { message: 'No existe un usuario con es ID' },
			});
		}

		usuario.nombre = body.nombre;
		usuario.email = body.email;
		usuario.role = body.role;

		usuario.save((err, usuarioGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar Usuarios',
					errors: err,
				});
            }
            
            usuarioGuardado.password=':)';

			res.status(200).json({
				ok: true,
				usuario: usuarioGuardado,
			});
		});
	});

});

// ====================================================
// Crear un nuevo Usuario
// ====================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
	var body = req.body;

	var usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		img: body.img,
		role: body.role,
	});

	usuario.save((err, usuarioGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error al crear usuario',
				errors: err,
			});
		}

		res.status(200).json({
			ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
		});
	});
});

// ====================================================
//  Borrar un usuario por el id
// ====================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res)=>{


    var id = req.params.id;
    
    Usuario.findByIdAndRemove(id, ( err, usuarioBorrado)=>{
        if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al Borrar usuario',
				errors: err,
			});
        }
        

        if (!usuarioBorrado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No existe un usuario con esa ID',
				errors: {message: 'No existe un usuario con esa ID'}
			});
		}

		res.status(200).json({
			ok: true,
			usuario: usuarioBorrado,
		});
    })
});
module.exports = app;
