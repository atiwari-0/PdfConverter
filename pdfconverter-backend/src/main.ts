import { NestFactory } from '@nestjs/core';
import { ConvertModule } from './convert/convert.module';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const folders = ['uploads', 'output'];
  folders.forEach((folder) => {
    const folderPath = path.join(__dirname, '..', folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  });

  const app = await NestFactory.create(ConvertModule);
  app.use('/static', express.static(path.join(__dirname, '..', 'output')));
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
