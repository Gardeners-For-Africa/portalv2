import { Injectable } from "@nestjs/common";
import { CloudinaryService } from "@scwar/nestjs-cloudinary";

@Injectable()
export class MediaService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async uploadFile(file: Express.Multer.File, folder: string) {
    const response = await this.cloudinary.upload(file.buffer, {
      folder,
      resource_type: "image",
    });

    return response.secure_url;
  }

  async deleteFile(publicId: string) {
    return this.cloudinary.delete(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  }
}
