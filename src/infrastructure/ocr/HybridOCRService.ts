import { injectable, inject } from 'inversify';
import { IOCRService } from '../../application/ports/IOCRService';
import { ISettingsRepository } from '../../application/ports/ISettingsRepository';
import { Result } from '../../domain/common/Result';
import { MLKitOCRService } from './MLKitOCRService';
import { CloudOCRService } from './CloudOCRService';
import { TYPES } from '../../infrastructure/di/types';

/**
 * Hybrid OCR Service
 * 
 * Combines on-device ML Kit OCR with cloud-based fallback.
 * Provides the best of both worlds: speed and privacy with ML Kit,
 * accuracy and reliability with cloud services.
 */
@injectable()
export class HybridOCRService implements IOCRService {
  private mlKitService: MLKitOCRService;
  private cloudService: CloudOCRService;
  private lastConfidenceScore: number = 0.0;
  private lastUsedService: 'mlkit' | 'cloud' | 'none' = 'none';

  constructor(
    @inject(TYPES.SettingsRepository) private settingsRepository: ISettingsRepository
  ) {
    this.mlKitService = new MLKitOCRService();
    this.cloudService = new CloudOCRService();
  }

  async extractText(imageUri: string): Promise<Result<string>> {
    try {
      // Get OCR quality setting
      const settingsResult = await this.settingsRepository.getSettings();
      if (!settingsResult.isSuccess) {
        return Result.failure(`Failed to get settings: ${settingsResult.error}`);
      }

      const { ocrQuality } = settingsResult.value;

      switch (ocrQuality) {
        case 'on-device':
          return await this.extractTextOnDevice(imageUri);
        case 'cloud':
          return await this.extractTextCloud(imageUri);
        case 'hybrid':
        default:
          return await this.extractTextHybrid(imageUri);
      }
    } catch (error) {
      return Result.failure(`OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractTextOnDevice(imageUri: string): Promise<Result<string>> {
    try {
      const result = await this.mlKitService.extractText(imageUri);
      if (result.isSuccess) {
        this.lastUsedService = 'mlkit';
        this.lastConfidenceScore = (await this.mlKitService.getLastConfidenceScore()).value || 0.0;
      }
      return result;
    } catch (error) {
      this.lastUsedService = 'none';
      return Result.failure(`On-device OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractTextCloud(imageUri: string): Promise<Result<string>> {
    try {
      const result = await this.cloudService.extractText(imageUri);
      if (result.isSuccess) {
        this.lastUsedService = 'cloud';
        this.lastConfidenceScore = (await this.cloudService.getLastConfidenceScore()).value || 0.0;
      }
      return result;
    } catch (error) {
      this.lastUsedService = 'none';
      return Result.failure(`Cloud OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractTextHybrid(imageUri: string): Promise<Result<string>> {
    try {
      // Try ML Kit first for speed and privacy
      const mlKitResult = await this.mlKitService.extractText(imageUri);
      
      if (mlKitResult.isSuccess) {
        this.lastUsedService = 'mlkit';
        this.lastConfidenceScore = (await this.mlKitService.getLastConfidenceScore()).value || 0.0;
        
        // If confidence is high enough, return the result
        if (this.lastConfidenceScore > 0.7) {
          return mlKitResult;
        }
      }

      console.warn('ML Kit OCR failed or low confidence, trying cloud fallback:', mlKitResult.error);

      // Fallback to cloud OCR
      const cloudResult = await this.cloudService.extractText(imageUri);
      
      if (cloudResult.isSuccess) {
        this.lastUsedService = 'cloud';
        this.lastConfidenceScore = (await this.cloudService.getLastConfidenceScore()).value || 0.0;
        return cloudResult;
      }

      // If both fail, return the on-device result (even if low confidence)
      if (mlKitResult.isSuccess) {
        return mlKitResult;
      }

      // Both services failed
      this.lastUsedService = 'none';
      return Result.failure(`Both ML Kit and cloud OCR failed. ML Kit: ${mlKitResult.error}, Cloud: ${cloudResult.error}`);
    } catch (error) {
      return Result.failure(`Hybrid OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractTextFromMultiple(imageUris: string[]): Promise<Result<string[]>> {
    try {
      const results: string[] = [];
      const errors: string[] = [];

      for (const imageUri of imageUris) {
        const result = await this.extractText(imageUri);
        if (result.isSuccess) {
          results.push(result.value);
        } else {
          errors.push(result.error);
        }
      }

      if (results.length === 0) {
        return Result.failure(`All OCR extractions failed: ${errors.join(', ')}`);
      }

      return Result.success(results);
    } catch (error) {
      return Result.failure(`Batch OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<Result<boolean>> {
    try {
      // Check if either service is available
      const mlKitAvailable = await this.mlKitService.isAvailable();
      const cloudAvailable = await this.cloudService.isAvailable();

      const isAvailable = (mlKitAvailable.isSuccess && mlKitAvailable.value) || 
                         (cloudAvailable.isSuccess && cloudAvailable.value);

      return Result.success(isAvailable);
    } catch (error) {
      return Result.failure(`Failed to check OCR availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLastConfidenceScore(): Promise<Result<number>> {
    try {
      return Result.success(this.lastConfidenceScore);
    } catch (error) {
      return Result.failure(`Failed to get confidence score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets information about which service was used for the last extraction
   */
  getLastUsedService(): 'mlkit' | 'cloud' | 'none' {
    return this.lastUsedService;
  }

  /**
   * Gets detailed status of both OCR services
   */
  async getServiceStatus(): Promise<{
    mlKit: { available: boolean; error?: string };
    cloud: { available: boolean; error?: string };
  }> {
    const mlKitStatus = await this.mlKitService.isAvailable();
    const cloudStatus = await this.cloudService.isAvailable();

    return {
      mlKit: {
        available: mlKitStatus.isSuccess && mlKitStatus.value,
        error: mlKitStatus.isSuccess ? undefined : mlKitStatus.error,
      },
      cloud: {
        available: cloudStatus.isSuccess && cloudStatus.value,
        error: cloudStatus.isSuccess ? undefined : cloudStatus.error,
      },
    };
  }
}
