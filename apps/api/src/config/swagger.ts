import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ISCOM API',
            version: '1.0.0',
            description: 'API documentation for ISCOM backend',
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Local server',
            },
        ],
    },
    apis: ['./src/api/controllers/*.ts', './src/data/dto/*.ts', './src/api/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
