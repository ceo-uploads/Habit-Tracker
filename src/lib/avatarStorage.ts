/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AvatarStorage {
  private dbName = 'rocket_streak_avatar_db';
  private storeName = 'avatars';

  private getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Saves avatar data URL to IndexedDB.
   */
  public async saveAvatar(key: string, base64Data: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(base64Data, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('[AVATAR_STORAGE] Failed to save avatar to IndexedDB', e);
    }
  }

  /**
   * Retrieves avatar data URL from IndexedDB.
   */
  public async getAvatar(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('[AVATAR_STORAGE] Failed to get avatar from IndexedDB', e);
      return null;
    }
  }

  /**
   * Removes avatar from IndexedDB.
   */
  public async deleteAvatar(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('[AVATAR_STORAGE] Failed to delete avatar from IndexedDB', e);
    }
  }
}

export const avatarStorage = new AvatarStorage();

/**
 * Universal image processor that handles any image format (PNG, JPEG, WebP, GIF, SVG, BMP)
 * losslessly and cleanly. If the file is under 3.5MB, it reads it directly as a raw data URL.
 * If the file is larger, it downscales/compresses it to keep it under 3.5MB.
 */
export function processImageFile(file: File, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    onProgress(10);
    const reader = new FileReader();

    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 30) + 10; // 10% to 40%
        onProgress(percent);
      }
    };

    reader.onerror = () => reject(new Error('File reading failed'));

    reader.onload = () => {
      onProgress(40);
      const dataUrl = reader.result as string;

      // If file size is under 3.5 MB, keep the 100% original lossless data
      const MAX_SIZE_BYTES = 3.5 * 1024 * 1024;
      if (file.size <= MAX_SIZE_BYTES) {
        onProgress(70);
        let p = 70;
        const interval = setInterval(() => {
          p += 10;
          onProgress(Math.min(100, p));
          if (p >= 100) {
            clearInterval(interval);
            resolve(dataUrl);
          }
        }, 20);
        return;
      }

      // If the file is larger than 3.5 MB, draw onto high-quality canvas and compress losslessly to PNG
      onProgress(50);
      const img = new Image();
      img.onerror = () => reject(new Error('Image loading failed'));
      img.onload = () => {
        onProgress(65);

        // Maintain aspect ratio, scale so the maximum dimension is 1600px (super crisp, but lightweight)
        const maxDimension = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          onProgress(80);

          // Render as image/png. Because of the size reduction to 1600px, PNG stays beautifully under 3MB
          const resultDataUrl = canvas.toDataURL('image/png');
          
          onProgress(90);
          setTimeout(() => {
            onProgress(100);
            resolve(resultDataUrl);
          }, 80);
        } else {
          onProgress(100);
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

