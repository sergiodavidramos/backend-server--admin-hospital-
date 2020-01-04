var express = require('express');

var mdAutenticacion = require('../middleware/autenticacion');


var app = express();

var Hospital = require('../models/hospital');


// ====================================================
// Obtener hospitales por ID
// ====================================================
app.get('/:id',(req, res)=>{

    var id = req.params.id;

    Hospital.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, hospital)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            })
        }
        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id '+id +' no existe',
                errors: {mensaje: 'No existe el hospital con esa ID'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospital
        });
    });
})
// ====================================================
// Obtener todos los hospitales
// ====================================================

app.get('/', (req, res)=>{


    var desde = req.query.desde || 0;
	desde = Number(desde);

    Hospital.find({})
        // .skip(desde)	
        // .limit(5)
        .populate('usuario', 'nombre email')
        .exec( (err, hospitales)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar los Hospitales',
                errors: err
            });
        }
       
        Hospital.count({}, (err, conteo)=>{
            res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
            });

        })

    })
});

// ====================================================
// Crear un nuevo Hospital
// ====================================================
app.post('/',mdAutenticacion.verificaToken, (req, res)=>{
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Hospital',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        })
    })
});

// ====================================================
// Actualizar un nuevo Hospital
// ====================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res)=>{
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital)=>{
        if(err){
            return res.status(500),json({
                ok: false,
                mensaje: 'Error al buscar el Hospital',
                errors: err
            });
        }

        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con la ID: '+ id + 'no existe',
                errors: {message: 'No existe un hospital con esa ID'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalActualizado)=>{
            if(err){
                return res.status(500),json({
                    ok: false,
                    mensaje: 'Error al actualizar el Hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            })
        });

    })
});
// ====================================================
//  Borrar un hospital por el id
// ====================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res)=>{

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el Hospital',
                errors: err
            });
        }  

        if(! hospitalBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital con esa ID',
                errors: { message: 'no existe el hospital'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
});


module.exports = app;