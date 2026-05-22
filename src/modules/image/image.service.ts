import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { Readable } from 'stream';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async upload(base64String: string) {
    const { secure_url, public_id } =
      await this.cloudinaryService.uploadImage(base64String);
    const image = new Image(secure_url, public_id);
    return await this.imageRepository.save(image);
  }

  async uploadStream(stream: Readable) {
    const { secure_url, public_id } =
      await this.cloudinaryService.uploadStream(stream);
    const image = new Image(secure_url, public_id);
    return await this.imageRepository.save(image);
  }

  async findOne(id: number) {
    const image = await this.imageRepository.findOne({
      where: {
        id,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  async update(base64String: string, publicId: string) {
    const image = await this.imageRepository.findOne({
      where: {
        publicId,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.cloudinaryService.updateImage(base64String, publicId);

    return image;
  }

  async remove(id: number) {
    const image = await this.findOne(id);

    await this.cloudinaryService.deleteImage(image.publicId);

    await this.imageRepository.remove(image);

    return {
      success: true,
      message: 'Image deleted successfully',
    };
  }
}
