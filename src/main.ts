if (process.env.NEW_RELIC_ENABLED === "true") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("newrelic");
}
import { writeFileSync } from "fs";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./shared/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = new Logger("Bootstrap");

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Payment Service API")
    .setDescription("API de cobrança e integração com Mercado Pago")
    .setVersion("1.0.0")
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, swaggerDocument);

  writeFileSync("swagger.json", JSON.stringify(swaggerDocument, null, 2));

  const port = Number(process.env.PORT ?? 3004);
  await app.listen(port);
  logger.log(`Payment Service running on port ${port}`);
}

void bootstrap();
