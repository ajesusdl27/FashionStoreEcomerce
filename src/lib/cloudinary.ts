/**
 * Cloudinary Configuration and Utilities
 *
 * Provides functions for uploading images to Cloudinary
 * and generating optimized URLs with transformations.
 */
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Type for transformation options
interface TransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
}

/**
 * Upload an image buffer to Cloudinary
 * @param buffer - Image buffer
 * @param filename - Original filename for reference
 * @returns Cloudinary secure URL
 */
export async function uploadImage(
  buffer: Buffer,
  _filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "fashionstore/products",
        resource_type: "image",
        // Auto-optimize on upload
        transformation: {
          quality: "auto",
          fetch_format: "auto",
        },
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("No result from Cloudinary"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

/**
 * Extract public ID from Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;

  // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/filename.ext
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match?.[1] ?? null;
}

/**
 * Generate optimized Cloudinary URL with transformations
 * Falls back to original URL if not a Cloudinary URL
 */
export function getOptimizedUrl(
  url: string,
  options: TransformOptions = {}
): string {
  if (!isCloudinaryUrl(url)) {
    return url; // Return original for non-Cloudinary URLs (e.g., Supabase)
  }

  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return url;

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        crop,
        quality,
        fetch_format: format,
      },
    ],
    secure: true,
  });
}

/**
 * Generate srcset for responsive images
 */
export function getResponsiveSrcset(
  url: string,
  widths: number[] = [400, 800, 1200]
): string {
  if (!isCloudinaryUrl(url)) {
    return url; // Can't generate srcset for non-Cloudinary URLs
  }

  return widths
    .map((w) => `${getOptimizedUrl(url, { width: w })} ${w}w`)
    .join(", ");
}

/**
 * Generate blur placeholder URL (tiny blurred version)
 */
export function getBlurPlaceholder(url: string): string {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return url;

  return cloudinary.url(publicId, {
    transformation: [
      {
        width: 20,
        quality: 30,
        effect: "blur:1000",
        fetch_format: "auto",
      },
    ],
    secure: true,
  });
}
