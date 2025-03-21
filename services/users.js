const express = require('express');
require('../db');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const usersController = require('../controllers/UsersController');
const app = express();
const PORT = 3001;

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

/**
 * @swagger
 * /users/get-token/:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Obtener el token de autorizacion
 *     description: autentica el usuario con su email y clave de api para obtener un token de autorizacion
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: email del usuario
 *       - in: query
 *         name: api_key
 *         schema:
 *           type: string
 *         required: false
 *         description: clave de api del usuario
 *       - in: body
 *         name: body
 *         description: Alternativa para enviar los datos de autenticacion
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "coserricky98@gmail.com"
 *             api_key:
 *               type: string
 *               example: "5f7b7f4b5b1f0d0017f2c2f3"
 *     responses:
 *       200:
 *         description: Token generado con exito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       404:
 *         description: Error al autenticar el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *  */

app.post('/get-token', async (req, res) => {
    if(Object.keys(req.query).length > 0) {
        var request = req.query;
    }else if(Object.keys(req.body).length > 0) {
        var request = req.body;
    }
    const { email, api_key } = request;
    try {
        const result = await usersController.authenticate(email, api_key);
        return res.json(result);
    } catch (error) {
        return res.status(404).json({ message: "Error al autenticar el usuario", error: error.message });
    }
})

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Crear un nuevo usuario
 *     description: Crear un nuevo usuario en la base de datos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ricardo Benavides"
 *               email:
 *                 type: string
 *                 example: "coserricky98@gmail.com"
 *               password:
 *                 type: string
 *                 example: "qwerty12345"
 *     responses:
 *       201:
 *         description: Usuario creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario creado con éxito"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "5f7b7f4b5b1f0d0017f2c2f3"
 *                     name:
 *                       type: string
 *                       example: "Ricardo Benavides"
 *                     email:
 *                       type: string
 *                       example: "coserricky98@gmail.com"
 *                     api_key:
 *                       type: string
 *                       example: "5f7b7f4b5b1f0d0017f2c2f3"
 *       400:
 *         description: Error al crear el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Faltan datos requeridos para crear el usuario"
 */
app.post('/', async (req, res) => {
    console.log('Peticion recibida desde el puerto 8000');
    console.log(req.body);
    usersController.create(req, res);
});

app.get('/', async (req, res) => {
    res.send('Hola desde el microservicio de Users');
});

app.listen(PORT, () => {
    console.log('Microservicio de Users corriendo en el puerto: ' + PORT);
});