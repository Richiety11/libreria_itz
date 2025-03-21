const express = require('express');
const librosController = require('./controllers/LibrosController');
const usersController = require('./controllers/UsersController');
const authenticateJWT = require('./authMiddleware.js');
const router = express.Router();
//rutas no protegidas

/**
 * @swagger
 * /get-token/:
 *  post:
 *      summary: Obtener el token de autorizacion
 *      parameters:
 *          - in: path
 *            name: api_key
 *            required: true
 *            description: api_key del usuario
 *            schema:
 *                type: string
 *          - in: path
 *            name: email
 *            required: true
 *            description: email del usuario
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Obtener el token
 *  */
router.post('/get-token', async (req, res) => {
    //Para que el api funcione y reciba el request desde el body o la query
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

//Rutas protegidas
//Definimos las rutas de usuarios
/**
 * @swagger
 * /users:
 *  post:
 *      summary: Crear un nuevo usuario
 *      consumes:
 *         - application/json
 *      parameters:
 *          - in: body
 *            required: true
 *            name: users
 *            schema:
 *                type: object
 *                properties:
 *                    email:
 *                        type: string
 *                    password:
 *                        type: string
 *                example:
 *                    email: "rabg1909.isc@gmail.com"
 *                    password: "admin123"
 *      responses:
 *          200:
 *              description: Usuario creado con exito
 *  */
router.post('/users', async (req, res) => {
    usersController.create(req, res);
});

//Definimos las rutas de libros

/**
 * @swagger
 * /libros:
 *  get:
 *      summary: Obtener todos los libros
 *      responses:
 *         200:
 *          description: Lista de libros
 *  */
router.get('/libros', authenticateJWT, async (req, res) => {
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
router.get('/libros/:id', authenticateJWT, async (req, res) => {
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
router.post('/libros', authenticateJWT, async (req, res) => {
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
router.put('/libros/:id', authenticateJWT, async (req, res) => {
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
router.delete('/libros/:id', authenticateJWT, async (req, res) => {
    librosController.delete(req, res);
});

module.exports = router;