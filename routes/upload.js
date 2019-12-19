var express = require('express');

// importamos el express-fileupload para subir archivos
var fileUpload =require('express-fileupload');
// fileSistem
var fs =require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
// dafault options middleware para el express-fileUpload
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next)=>{

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valido',
            errors: {message: 'Tipo de coleccion no es valido'}
        });
    }


    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: {message: 'debe de seleccionar una imagen'}
        });
    }

    // Obtener el nombre del archivo enviado
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extencionArchivo = nombreCortado[ nombreCortado.length - 1];
    

    // solo estas extenciones seran aceptadas
    var extencionesValidas = ['png', 'jpg', 'gif','jpeg'];

    if(extencionesValidas.indexOf(extencionArchivo)<0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extencion no valida',
            errors: {message: 'Las extenciones validas son: '+ extencionesValidas.join(', ')}
        });
    }


    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv( path, err=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            }); 
        }

        subirPorTipo( tipo, id, nombreArchivo, res)
   
    })

});

function subirPorTipo( tipo, id, nombreArchivo, res){

    if(tipo === 'usuarios'){
        Usuario.findById(id, (err, usuario)=>{

            if(!usuario){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'EL usuario no existe'}
                }); 
            }

            var pathViejo = './uploads/usuarios/'+usuario.img;
            
            // Si existe elimina la imagen anterior
            console.log(pathViejo);
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }
            // if(fs.existsSync(pathViejo)){
            //     fs.unlink(pathViejo); esto ya no da con la ultima actualizacion
            // }
 
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado)=>{
                usuarioActualizado.password = ':)';

               return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if(tipo === '   '){
        Medico.findById(id, (err, medico)=>{
          
            if(!medico){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: {message: 'EL medico no existe'}
                }); 
            }

            var pathViejo = './uploads/medicos/'+medico.img;

            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save( (err, medicoActualizado)=>{
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico actualizado',
                    medico: medicoActualizado
                });
            })
        });
    }

    if(tipo === 'hospitales'){
        Hospital.findById(id, (err, hospital)=>{
         
            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: {message: 'EL hospital no existe'}
                }); 
            }
            var pathViejo = './uploads/hospitales/'+hospital.img;

            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalActualizado)=>{
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizado',
                    medico: hospitalActualizado
                });
            })
        });
    }

}

module.exports = app;