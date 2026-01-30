/**
 * Storage Service Implementation
 */

import type { IStorageService } from '../../application/ports/services';

export class StorageService implements IStorageService {
  // TODO: 실제 스토리지 서비스와 연동 (S3, Cloud Storage 등)

  async upload(_file: File, _path: string): Promise<string> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async download(_url: string): Promise<Blob> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async delete(_url: string): Promise<void> {
    // TODO: 구현
    throw new Error('Not implemented');
  }
}
