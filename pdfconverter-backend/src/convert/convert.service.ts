import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConvertService {
  private readonly logger = new Logger(ConvertService.name);
  private readonly supportedExtensions = ['.txt', '.png', '.jpg', '.jpeg'];
  private readonly maxFileSize = 10 * 1024 * 1024;

  async convertMultipleToPdf(
    files: Array<{ path: string; originalname: string }>,
  ): Promise<string> {
    await Promise.all(files.map((file) => this.validateFile(file.path)));

    const outputFileName = `${uuidv4()}.pdf`;
    const outputPath = path.join('output', outputFileName);

    const doc = new PDFDocument({
      pdfVersion: '1.5',
      lang: 'en-US',
      displayTitle: true,
    });

    doc.info.Title = 'Combined Documents';
    doc.info.Author = 'PDF Converter Service';
    doc.info.CreationDate = new Date();

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    try {
      for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.txt') {
          const content = await fsPromises.readFile(file.path, 'utf-8');
          doc.font('Helvetica').fontSize(12).text(content, {
            align: 'left',
            lineGap: 5,
          });
        } else {
          doc.image(file.path, {
            fit: [500, 700],
            align: 'center',
            valign: 'center',
          });
        }
        if (file !== files[files.length - 1]) {
          doc.addPage();
        }
      }

      doc.end();

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          this.logger.log(`PDF generated: ${outputFileName}`);
          resolve(outputFileName);
        });
        writeStream.on('error', (err: Error) => {
          this.logger.error('PDF generation failed', err.stack);
          reject(err);
        });
      });
    } catch (err: unknown) {
      await this.cleanupFile(outputPath);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unknown error occurred during PDF conversion');
    }
  }

  private async validateFile(filePath: string): Promise<void> {
    try {
      const stats = await fsPromises.stat(filePath);
      if (stats.size > this.maxFileSize) {
        throw new Error('File size exceeds maximum limit');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(`Invalid file: ${err.message}`);
      }
      throw new Error('Unknown error occurred while validating file');
    }
  }

  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await fsPromises.unlink(filePath);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.warn(`Failed to cleanup file: ${filePath}`, err);
      } else {
        this.logger.warn(`Failed to cleanup file: ${filePath}`, String(err));
      }
    }
  }
}
