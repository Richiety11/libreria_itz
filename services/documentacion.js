const express = require('express');
const {swaggerSpecs, swaggerUi, optionsV2} = require('../swagger');
const app = express();
const PORT = 3002;

//Configuracion de Swagger UI
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, optionsV2));

app.listen(PORT, () => {
    console.log('Microservicio de Documentacion corriendo en el puerto: ' + PORT);
});