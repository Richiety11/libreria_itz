//Swagger
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {SwaggerTheme, SwaggerThemeNameEnum} = require('swagger-themes');  
const theme = new SwaggerTheme;
const path = require('path');

//Configuracion de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API REST de Libros',
            version: '1.0.0',
            description: 'API para administar libros con NodeJS y Express',
            termsOfService: 'http://localhost:3000/terms/',
            contact: {
                name: 'Ricardo Benavides',
                email: 'rabg1909.isc@gmail.com',
                url: 'http://localhost:3000/contact/'
            }
        }, 
        components: {
            securitySchemes: {
                apiKeyAuth: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                    description: 'Añade tu token de seguridad en la cabecera de la solicitud'
                }
            },
        },
        security: [
            {
                apiKeyAuth: [] // Aplica esta configuración por defecto
            }
        ]
    },
    apis: [
        //path.join(__dirname, 'routes.js'),
        path.join(__dirname, 'services/libros.js'), 
        path.join(__dirname, 'services/users.js')
    ],
};

const optionsV1 = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
};

const optionsV2 = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.CLASSIC),
};

const swaggerSpecs = swaggerJSDoc(swaggerOptions);

module.exports = {
    swaggerUi,
    swaggerSpecs,
    optionsV2
};