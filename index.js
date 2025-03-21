const express = require('express');
//Importamos la conexion a la base de datos
require('./db');
//Importamos cors para permitir peticiones desde otros dominios
const cors = require('cors');
//importamos body-parser
const bodyParser = require('body-parser');
//Importamos rutas
const routes = require('./routes');
//Importamos configuracion de swagger
const {swaggerSpecs, swaggerUi, optionsV2, optionsV1} = require('./swagger');
//Importamos express-rate-limit
const rateLimit = require('express-rate-limit');
//Creamos el servidor
const app = express();
const port = 3000;

//Agreamos el middleware para poder parsear/recibir JSON
app.use(express.json());
//Agregamos el middleware para poder parsear/recibir datos de formularios
app.use(bodyParser.urlencoded({ extended: true }));
//Agregamos el middleware de cors
app.use(cors());
//Limitar las conexiones por tiempo limitado
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutos
    max: 10, // limite de peticiones por el tiempo establecido
    message: 'Demasiadas peticiones, por favor espera 1 minuto'
});
//Agregamos el middleware de rate limit
app.use(limiter);

//Limitar el tamaño de las peticiones al servidor (desbordamiento de buffer)
app.use(bodyParser.json({limit: '1mb'}));

//Agregamos las rutas
app.use(routes);

//Configuracion de Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, optionsV1));

//Iniciamos el servidor
app.listen(port, () => {
    console.log('Servidor corriendo en el puerto: ' + port);
});

