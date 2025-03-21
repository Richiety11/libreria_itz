//Importamos mongoose
var mongoose = require('mongoose');

//Definimos la URL de la base de datos
var MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/libreria_itz_db';

//Conectamos a la base de datos
mongoose.connect(MONGO_URL);

//Verificamos si se conecto correctamente
mongoose.connection.on('connected', function () {
    console.log('Conectado a la base de datos: ' + MONGO_URL);
});

//Verificamos si hubo un error al conectar
mongoose.connection.on('error', function (err) {
    console.log('Error al conectar a la base de datos: ' + err);
});

//Verificamos si se desconecto de la base de datos
mongoose.connection.on('disconnected', function () {
    console.log('Desconectado de la base de datos');
});