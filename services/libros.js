const express = require('express');
require('../db');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const usersController = require('../controllers/LibrosController');
const authenticateJWT = require('../authMiddleware.js');
const app = express();
const PORT = 3000;

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
 * /libros:
 *  get:
 *      summary: Obtener todos los libros
 *      responses:
 *         200:
 *          description: Lista de libros
 *  */
app.get('/', authenticateJWT, async (req, res) => {
    librosController.list(req, res);
});

/**
 * @swagger
 * /libros/{id}:
 *  get:
 *      summary: Obtener un libro por su ID
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: ID del libro
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Detalles de un libro
 *  */
app.get('/:id', authenticateJWT, async (req, res) => {
    librosController.show(req, res);
});

/**
 * @swagger
 * /libros:
 *  post:
 *      summary: Crear un nuevo libro
 *      consumes:
 *         - application/json
 *      parameters:
 *          - in: body
 *            required: true
 *            name: libros
 *            schema:
 *                type: object
 *                properties:
 *                    titulo:
 *                        type: string
 *                    autor:
 *                        type: string
 *                    year:
 *                        type: integer
 *                example:
 *                    titulo: "El señor de los anillos"
 *                    autor: "J.R.R. Tolkien"
 *                    year: 1954
 *      responses:
 *          200:
 *              description: Libro creado con exito
 *  */
app.post('/', authenticateJWT, async (req, res) => {
    librosController.create(req, res);
});

/**
 * @swagger
 * /libros/{id}:
 *  put:
 *      summary: Actualizar un libro por su ID
 *      consumes:
 *          - application/json
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: ID del libro
 *            schema:
 *                type: string
 *          - in: body
 *            name: body
 *            description: Datos del libro a actualizar
 *            required: true
 *            schema:
 *                type: object
 *                properties:
 *                    titulo:
 *                        type: string
 *                    autor:
 *                        type: string
 *                    year:
 *                        type: integer
 *                example:
 *                    titulo: "El señor de los anillos"
 *                    autor: "J.R.R. Tolkien"
 *                    year: 1958
 *      responses:
 *         200:
 *             description: Libro actualizado con exito
 *         400:
 *             description: Datos invalidos para actualizar
 *         404:
 *             description: Libro no encontrado
 *         500:
 *             description: Error interno del servidor
 */
app.put('/:id', authenticateJWT, async (req, res) => {
    librosController.update(req, res);
});

/**
 * @swagger
 * /libros/{id}:
 *  delete:
 *      summary: Eliminar un libro por su ID
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: ID del libro
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Libro eliminado con exito
 *          404:
 *              description: Libro no encontrado
 */
app.delete('/:id', authenticateJWT, async (req, res) => {
    librosController.delete(req, res);
});

app.listen(PORT, () => {
    console.log('Microservicio de Libros corriendo en el puerto: ' + PORT);
});