
const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const axios = require('axios');

const app = express();
const PORT = 8000;

//Lista de microservicios con su puerto
const services = {
    libros: 'http://localhost:3000',
    users: 'http://localhost:3001',
    documentacion: 'http://localhost:3002'
};
//Middleware para compronbar si el microservicio esta disponible
const checkServiceStatus = async (req, res, next) => {
    //Extraer el primer segmento de la URL
    //http://localhost:8000/users -> [0] = localhost:8000 -> [1] = users
    const serviceName = req.originalUrl.split('/')[1];
    const serviceUrl = services[serviceName];
    if (!serviceUrl) {
        return res.status(404).json({ error: 'Microservicio no encontrado' });
    }
    try {
        await axios.get(serviceUrl); //Intenta hacer una peticion al microservicio
        next(); //Si el microservicio esta disponible, continua el flujo del proxy
    } catch (error) {
        console.log(error);
        return res.status(503).json({ error: 'El servcio: ' + serviceName + ' no esta disponible' });
    }  
};

//Aplicamos el middleware en la verificacion antes del proxy
app.use('/users', checkServiceStatus, createProxyMiddleware({ 
    target: services.users,
    changeOrigin: true 
}));

app.use('/libros', checkServiceStatus, createProxyMiddleware({ 
    target: services.libros,
    changeOrigin: true 
}));

app.use('/documentacion', checkServiceStatus, createProxyMiddleware({ 
    target: services.documentacion,
    changeOrigin: true, 
    pathRewrite: {'^/documentacion': '/'}
}));

app.listen(PORT, () => {
    console.log('LoadBalancer corriendo en el puerto: ' + PORT);
});