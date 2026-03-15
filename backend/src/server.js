const express = require('express');
const cors = require('cors');
require('dotenv').config();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Routes
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Swagger Options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gestão de Pedidos (SGP) API',
      version: '1.0.0',
      description: 'API Documentada para o Monorepo do Sistema de Pedidos - Supabase Hosted',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`, // URL base para desenvolvimento
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Caminho para os arquivos de rotas onde anotamos o swagger
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

// Endpoint da Documentação Interativa
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * Endpoint de Health Check do Servidor (Evita Cold Starts)
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SGP Backend is running', timestamp: new Date() });
});

// Endpoint das Rotas de Pedidos (Protegidas pelo Middleware na propria rota)
app.use('/orders', orderRoutes);

// Apenas inicia o servidor se nao estiver sendo interpelado pelo Jest
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;

