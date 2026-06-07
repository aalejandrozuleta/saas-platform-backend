"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwaggerConfig = createSwaggerConfig;
const swagger_1 = require("@nestjs/swagger");
function createSwaggerConfig(serviceName, version = '1.0.0') {
    return new swagger_1.DocumentBuilder()
        .setTitle(`${serviceName} API`)
        .setDescription(`Documentación del servicio ${serviceName}`)
        .setVersion(version)
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    }, 'access-token')
        .build();
}
