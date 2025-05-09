const os = require('os');
const http = require('http');
//npm i cluster http-proxy
const cluster = require('cluster');
const { createProxyServer } = require('http-proxy');
const {cpuUsage, pid} = require('process');
const master = require('cluster/lib/master');

//Obtener el numero de CPUs disponibles en el sistema
const numCPUs = os.cpus().length;
const MAX_PODS = 10; // Número máximo de pods en el cluster
let numPods = Math.min(4, numCPUs); // Número de pods en el cluster
const PORT = 8000; // Puerto en el que el balanceador de carga escucha

//Verficar el servidor actual es el servidor principal
if (cluster.isMaster) {
    console.log('Servidor maestro iniciado en el puerto ' + PORT);
    //Arreglo para almacenar los pods activos
    const pods = [];
    const podsStats = {};

    for (let i = 0; i < numPods; i++) {
            const pod = cluster.fork(); // Crear un nuevo pod
            pods.push(pod); //lo almacenamos en la lista de pods
    }
    //Creamos un server para el monitoreo de los pods
    const express = require('express');
    const path = require('path');
    const app = express();
    const monitorPORT = 8080; // Puerto para el servidor de monitoreo

    app.set('view engine', 'ejs'); // Usar EJS como motor de plantillas
    app.set('views', path.join(__dirname, 'views')); // Establecer la carpeta de vistas

    // Ruta para estadisticas de los pods
    //Nos regresa la vista de estadisticas
    app.get('/stats', (req, res) => {
            res.render('stats');
    });

    //Ruta para obtener los datos de las estadisticas
    app.get('/api/stats', (req, res) => {
        const memoryUsage = process.memoryUsage().rss / 1024 / 1024; //Obtener el uso de memoria en MB
        const cpuUsage = os.loadavg()[0]/ numCPUs*100; //Obtener el uso de CPU en porcentaje
        res.json({
            master: {
                pid: process.pid,
                cpu: cpuUsage.toFixed(2),
                memory: memoryUsage.toFixed(2),
                podsCount: pods.length,
            },
            pods: Object.values(podsStats)
        });
    });

    //Iniciar el servidor de monitoreo
    app.listen(monitorPORT, () => {
        console.log('Servidor de monitoreo iniciado en el puerto ' + monitorPORT);
    });
    
    //indice para el balanceo de carga (round-robin)
    let podSeleccionado = 0; 
    // Instancia para rediirigir el trafico a los pods
    const proxy = createProxyServer(); 

    //Creamos el servidor que actuara como balanceador de carga
    const server = http.createServer((req, res) => {
        if (pods.length == 0) {
            res.writeHead(503, { 'Content-Type': 'text/plain' });
            res.end('No hay pods disponibles');
            return;
        }

        //Seleccionamos un pod en orden round-robin
        const pod = pods[podSeleccionado % pods.length];
        podSeleccionado++;

        //Construir la URL de destino del pod
        const target = "http://localhost:" + pod.port;
        console.log('Redirigiendo petición a ' + req.url + "al pod en el puerto " + pod.port);

        proxy.web(req, res, { target }, (err) => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error en el balanceador de carga: ');
            console.erro('Error al redirigir la petición a: ' + target, err);
        });
    })
    //Iniciar el servidor en el puerto definido
    server.listen(PORT, () => {
        console.log('Balanceador de carga iniciado en el puerto ' + PORT);
    })
    
    //Manejar errores en los pods o pods muertos
    cluster.on('exit', (pod) => {
        const newPod = cluster.fork();
        pods[pods.indexOf(pod)] = newPod; //Reemplazamos el pod muerto por uno nuevo
    })

    //Captura de la informacion de los pods, como su puerto, uso de cpu y uso de memoria
    cluster.on('online', (pod) => {
        pod.on('message', (message) => {
            if (message.port) {
                pod.port = message.port;
            }
            if (message.stats) {
                podsStats[pod.process.pid] = {pid: pod.process.pid, cpu: message.stats.cpu, memory: message.stats.memory};
                console.log('Pod ' + pod.process.pid + ' CPU: ' + message.stats.cpu + ' Memoria: ' + message.stats.memory );

            }
        })
    })
    //Monitorear el servidor master cada 5 segundos
    setInterval(() => {
        const memoryUsage = process.memoryUsage().rss / 1024 / 1024; //Obtener el uso de memoria en MB
        const cpuUsage = os.loadavg()[0]/ numCPUs*100; //Obtener el uso de CPU en porcentaje
        console.log('Servidor maestro: ' + process.pid + ' Uso de CPU: ' + cpuUsage.toFixed(2) + '%' + ' Uso de memoria: ' + memoryUsage.toFixed(2) + 'MB');
        //Si el uso de CPU supera el 50% y el numero de pods es menor que el maximo permitido
        //Creamos un nuevo pod
        if(cpuUsage > 50 && pods.length < MAX_PODS){
            const newPod = cluster.fork();
            pods.push(newPod);
            numPods++;
            console.log('El uso de CPU supera el 50% y se ha creado un nuevo pod');
        }
    }, 5000);
}else{
    //Codigo que van a ejecutar los pods
const express = require('express');
require('./db');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
//Importamos configuracion de swagger
const {swaggerSpecs, swaggerUi, optionsV2, optionsV1} = require('./swagger');
const rateLimit = require('express-rate-limit');
const app = express();
const podPORT = 3000 + cluster.worker.id;

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
app.use(limiter);

//Limitar el tamaño de las peticiones al servidor (desbordamiento de buffer)
app.use(bodyParser.json({limit: '1mb'}));
//Agregamos las rutas
app.use(routes);
//Configuracion de Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, optionsV1));

//Ruta principal para verificar que pod maneja la peticion
app.get('/', (req, res) => {
    res.send('Pod: ' + process.pid + ' corriendo en el puerto: ' + podPORT);
});

//Iniciamos el servidor en el puerto aignado
const server = app.listen(podPORT, () => {
    console.log('POD corriendo en el puerto: ' + podPORT);
    process.send({ port: podPORT }); //Enviamos el puerto al servidor master
})

setInterval(() => {
    const memoryUsage = process.memoryUsage().rss/ 1024 / 1024; //Obtener el uso de memoria en MB
    const cpuUsage = os.loadavg()[0]/ numCPUs*100; //Obtener el uso de CPU en porcentaje
    process.send({ stats: { cpu: cpuUsage.toFixed(2), memory: memoryUsage.toFixed(2)}});
}, 5000);
}