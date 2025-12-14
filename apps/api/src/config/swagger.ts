import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
    definition: {
        info: {
            description: 'API documentation for ISCOM backend',
            title: 'ISCOM API',
            version: '1.0.0',
        },
        openapi: '3.0.0',
        servers: [
            {
                description: 'Producción (Render)',
                url: 'https://iscom-api-core.onrender.com/api',
            },
            {
                description: 'Local',
                url: 'http://localhost:3000/api',
            },
        ],
    },
    apis: ['./src/api/controllers/*.ts', './src/data/dto/*.ts', './src/api/routes/*.ts'], // Path to the API docs
};

// Add explicit components definition for security schemes that might be missing from auto-discovery
if (options.definition) {
    options.definition.components = {
        securitySchemes: {
            ApiKeyAuth: {
                in: 'header',
                name: 'x-api-key',
                type: 'apiKey',
            },
        },
    };
}


const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
