// Kho ảnh trong bộ nhớ, tách riêng khỏi db (Post không có trường ảnh).
export interface StoredImage {
  type: string;
  bytes: Uint8Array;
}

const g = globalThis as unknown as { __foundImages?: Map<number, StoredImage> };
const images = (g.__foundImages ??= new Map<number, StoredImage>());

export const saveImage = (postId: number, image: StoredImage): void => {
  images.set(postId, image);
};

export const getImage = (postId: number): StoredImage | undefined => images.get(postId);
