var express = require('express');

var mdAutenticacion = require('../middleware/autenticacion');
var app = express();

var Medico = require('../models/medico');

// ====================================================
// Obtener medico por la id
// ====================================================
app.get('/:id', (req, res)=>{
	var id = req.params.id;

	Medico.findById(id)
			.populate('usuario', 'nombre email img')
			.populate('hospital')
			.exec((err, medico)=>{
				if (err) {
					return res.status(500).json({
						ok: false,
						mensaje: 'Error al buscar medico',
						errors: err,
					});
				}
		
				if (!medico) {
					return res.status(400).json({
						ok: false,
						mensaje: 'El medico con la ID: ' + id + 'No existe',
						errors: { message: 'No existe el medico con la ID' },
					});
				}

				res.status(200).json({
					ok: true,
					medico: medico,
	
				});

			})
})
// ====================================================
// Obtener todos los medicos
// ====================================================
app.get('/', (req, res) => {


    var desde = req.query.desde || 0;
	desde = Number(desde);

    Medico.find({})
        .skip(desde)	
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensage: 'Error al cargar los medicos',
				errors: err,
			});
		}

        Medico.count({},(err, conteo)=>{
            
            res.status(200).json({
                ok: true,
                medicos: medicos,
                total: conteo
            });
        })
	});
});
// ====================================================
// Crear un nuevo Usuario
// ====================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
	var body = req.body;

	var medico = new Medico({
		nombre: body.nombre,
		img: body.img,
		usuario: req.usuario._id,
		hospital: body.hospital,
	});

	medico.save((err, medicoGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error al crear al medico',
				errors: err,
			});
		}

		res.status(200).json({
			ok: true,
			medico: medicoGuardado,
			usuarioToken: req.usuario,
			hospital: body.hospital,
		});
	});
});

// ====================================================
// Actualizar un nuevo Medico
// ====================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Medico.findById(id, (err, medico) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar medico',
				errors: err,
			});
		}

		if (!medico) {
			return res.status(400).json({
				ok: false,
				mensaje: 'El medico con la ID: ' + id + 'No existe',
				errors: { message: 'No existe el medico con la ID' },
			});
		}

		medico.nombre = body.nombre;
		medico.img = body.img;
		medico.usuario = req.usuario._id;
		medico.hospital = body.hospital;

		medico.save((err, medicoActualizado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar Medico',
					errors: err,
				});
			}

			res.status(200).json({
				ok: true,
				medico: medicoActualizado,
			});
		});
	});
});

// ====================================================
//  Borrar un medico por el id
// ====================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;

	Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al Borrar medico',
				errors: err,
			});
		}

		if (!medicoBorrado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No existe un medico con esa ID',
				errors: { message: 'No existe un medico con esa ID' },
			});
		}

		res.status(200).json({
			ok: true,
			medico: medicoBorrado,
		});
	});
});

module.exports = app;
