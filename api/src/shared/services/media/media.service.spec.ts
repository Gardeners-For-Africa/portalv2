import { Test, TestingModule } from "@nestjs/testing";
import { CloudinaryService } from "@scwar/nestjs-cloudinary";
import { MediaService } from "./media.service";

describe("MediaService", () => {
  let service: MediaService;
  let cloudinaryService: CloudinaryService;

  beforeEach(async () => {
    const mockCloudinaryService = {
      upload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("uploadFile", () => {
    it("should upload a file successfully and return secure URL", async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "test-image.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("test-image-data"),
        stream: null as any,
        destination: "",
        filename: "",
        path: "",
      };

      const folder = "test-folder";
      const expectedUrl =
        "https://res.cloudinary.com/test/image/upload/v1234567890/test-folder/test-image.jpg";

      jest.spyOn(cloudinaryService, "upload").mockResolvedValue({
        secure_url: expectedUrl,
        public_id: "test-folder/test-image",
        version: 1234567890,
      } as any);

      // Act
      const result = await service.uploadFile(mockFile, folder);

      // Assert
      expect(result).toBe(expectedUrl);
      expect(cloudinaryService.upload).toHaveBeenCalledWith(mockFile.buffer, {
        folder,
        resource_type: "image",
      });
    });

    it("should handle upload errors", async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "test-image.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("test-image-data"),
        stream: null as any,
        destination: "",
        filename: "",
        path: "",
      };

      const folder = "test-folder";
      const error = new Error("Upload failed");

      jest.spyOn(cloudinaryService, "upload").mockRejectedValue(error);

      // Act & Assert
      await expect(service.uploadFile(mockFile, folder)).rejects.toThrow("Upload failed");
    });

    it("should upload file with different folders", async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "profile.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 2048,
        buffer: Buffer.from("profile-image-data"),
        stream: null as any,
        destination: "",
        filename: "",
        path: "",
      };

      const folder = "profiles";
      const expectedUrl =
        "https://res.cloudinary.com/test/image/upload/v1234567890/profiles/profile.jpg";

      jest.spyOn(cloudinaryService, "upload").mockResolvedValue({
        secure_url: expectedUrl,
        public_id: "profiles/profile",
        version: 1234567890,
      } as any);

      // Act
      const result = await service.uploadFile(mockFile, folder);

      // Assert
      expect(result).toBe(expectedUrl);
      expect(cloudinaryService.upload).toHaveBeenCalledWith(mockFile.buffer, {
        folder: "profiles",
        resource_type: "image",
      });
    });
  });

  describe("deleteFile", () => {
    it("should delete a file successfully", async () => {
      // Arrange
      const publicId = "test-folder/test-image";
      const mockDeleteResult = {
        result: "ok",
        public_id: publicId,
      };

      jest.spyOn(cloudinaryService, "delete").mockResolvedValue(mockDeleteResult as any);

      // Act
      const result = await service.deleteFile(publicId);

      // Assert
      expect(result).toBe(mockDeleteResult);
      expect(cloudinaryService.delete).toHaveBeenCalledWith(publicId, {
        resource_type: "image",
        invalidate: true,
      });
    });

    it("should handle delete errors", async () => {
      // Arrange
      const publicId = "invalid-public-id";
      const error = new Error("Delete failed");

      jest.spyOn(cloudinaryService, "delete").mockRejectedValue(error);

      // Act & Assert
      await expect(service.deleteFile(publicId)).rejects.toThrow("Delete failed");
    });

    it("should delete file with different public IDs", async () => {
      // Arrange
      const publicId = "profiles/user-123";
      const mockDeleteResult = {
        result: "ok",
        public_id: publicId,
      };

      jest.spyOn(cloudinaryService, "delete").mockResolvedValue(mockDeleteResult as any);

      // Act
      const result = await service.deleteFile(publicId);

      // Assert
      expect(result).toBe(mockDeleteResult);
      expect(cloudinaryService.delete).toHaveBeenCalledWith("profiles/user-123", {
        resource_type: "image",
        invalidate: true,
      });
    });

    it("should handle not found errors gracefully", async () => {
      // Arrange
      const publicId = "non-existent-file";
      const error = new Error("Not found");

      jest.spyOn(cloudinaryService, "delete").mockRejectedValue(error);

      // Act & Assert
      await expect(service.deleteFile(publicId)).rejects.toThrow("Not found");
    });
  });

  describe("integration scenarios", () => {
    it("should handle upload and delete workflow", async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "workflow-test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("workflow-test-data"),
        stream: null as any,
        destination: "",
        filename: "",
        path: "",
      };

      const folder = "workflow-test";
      const expectedUrl =
        "https://res.cloudinary.com/test/image/upload/v1234567890/workflow-test/workflow-test.jpg";
      const publicId = "workflow-test/workflow-test";

      // Mock upload
      jest.spyOn(cloudinaryService, "upload").mockResolvedValue({
        secure_url: expectedUrl,
        public_id: publicId,
        version: 1234567890,
      } as any);

      // Mock delete
      jest.spyOn(cloudinaryService, "delete").mockResolvedValue({
        result: "ok",
        public_id: publicId,
      } as any);

      // Act - Upload
      const uploadResult = await service.uploadFile(mockFile, folder);
      expect(uploadResult).toBe(expectedUrl);

      // Act - Delete
      const deleteResult = await service.deleteFile(publicId);
      expect((deleteResult as any).result).toBe("ok");

      // Assert
      expect(cloudinaryService.upload).toHaveBeenCalledTimes(1);
      expect(cloudinaryService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
