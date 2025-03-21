var mongoose = require('mongoose');
var schema = mongoose.Schema;

//Definimos el esquema de la entidad Libros
const libroSchema = new schema({
    titulo: String,
    autor: String,
    year: Number
});

//Definimos el modelo de la entidad Libros
const Libros = mongoose.model('Libros', libroSchema);

//Exportamos el modelo
module.exports = Libros;