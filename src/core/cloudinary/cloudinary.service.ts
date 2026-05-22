import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private opts = {
    overwrite: true,
    invalidate: true,
    resource_type: 'auto' as const,
    folder: 'cserver/nestjs_krustykrab_graphql/uploads',
  };

  uploadImage(
    image: string, // base64 or remote URL
  ): Promise<any> {
    try {
      return cloudinary.uploader.upload(image, this.opts);
    } catch (error) {
      throw new InternalServerErrorException(
        `Cloudinary upload failed: ${error.message}`,
      );
    }
  }

  uploadStream(stream: Readable): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const upload = cloudinary.uploader.upload_stream(
          {
            ...this.opts,
          },
          (error, result) => {
            if (error) throw new Error(error.message);

            return resolve(result);
          },
        );

        stream.pipe(upload);
      } catch (error) {
        reject(
          new InternalServerErrorException(
            `Cloudinary stream upload failed: ${error.message}`,
          ),
        );
      }
    });
  }

  deleteImage(publicId: string): Promise<void> {
    try {
      return cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Cloudinary delete failed: ${error.message}`,
      );
    }
  }

  async updateImage(
    image: string,
    publicId: string,
    opts: Record<string, any> = {},
  ): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.upload(image, {
        ...opts,
        public_id: publicId,
        overwrite: true,
      });

      return !!result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Cloudinary update failed: ${error.message}`,
      );
    }
  }
}
