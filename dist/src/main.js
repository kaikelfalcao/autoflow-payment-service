"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("newrelic");
const fs_1 = require("fs");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const domain_exception_filter_1 = require("./shared/infrastructure/filters/domain-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new domain_exception_filter_1.DomainExceptionFilter());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Billing Service API')
        .setDescription('API de cobrança e integração com Mercado Pago')
        .setVersion('1.0.0')
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, swaggerDocument);
    (0, fs_1.writeFileSync)('swagger.json', JSON.stringify(swaggerDocument, null, 2));
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    logger.log(`Billing Service running on port ${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map