import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { TWO_MB } from '../constants';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  async transform(file: FileUpload) {
    if (!file) {
      return;
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Invalid file type. Only image files are allowed',
      );
    }

    const stream = file.createReadStream();
    let size = 0;

    for await (const chunk of stream) {
      size += chunk.length;

      if (size > TWO_MB) {
        throw new BadRequestException('File size too large');
      }
    }

    return true;
  }
}
