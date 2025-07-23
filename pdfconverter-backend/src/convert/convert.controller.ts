import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ConvertService } from './convert.service';

@Controller('convert')
export class ConvertController {
  constructor(private readonly convertService: ConvertService) {}

  @Post('upload-multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadAndConvertMultiple(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const fileData = files.map((file) => ({
      path: file.path,
      originalname: file.originalname,
    }));

    const outputPath = await this.convertService.convertMultipleToPdf(fileData);
    return {
      message: 'PDF converted with multiple files',
      downloadUrl: `http://localhost:3000/static/${outputPath.split('/').pop()}`,
    };
  }
}
