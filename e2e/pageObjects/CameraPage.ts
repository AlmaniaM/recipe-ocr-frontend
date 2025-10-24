/**
 * Camera Page Object
 * 
 * Actions and assertions for the camera screen
 */

import { element, by } from 'detox';
import { BasePage } from './BasePage';

export class CameraPage extends BasePage {
  async capturePhoto() {
    await this.tapButton('capture-button');
    await this.waitForElement('image-preview', 10000);
  }

  async selectFromGallery() {
    await this.tapButton('gallery-button');
    await this.waitForElement('image-preview', 10000);
  }

  async confirmImage() {
    await this.tapButton('confirm-image-button');
  }

  async retakePhoto() {
    await this.tapButton('retake-button');
  }

  async cancelCapture() {
    await this.tapButton('cancel-button');
  }

  async expectCameraReady() {
    await this.expectVisible('camera-viewfinder');
    await this.expectVisible('capture-button');
  }

  async expectImagePreview() {
    await this.expectVisible('image-preview');
    await this.expectVisible('confirm-image-button');
    await this.expectVisible('retake-button');
  }

  async expectPermissionRequest() {
    await this.expectVisible('camera-permission-dialog');
  }

  async grantCameraPermission() {
    await this.tapButton('grant-permission-button');
  }

  async denyCameraPermission() {
    await this.tapButton('deny-permission-button');
  }

  async expectPermissionDenied() {
    await this.expectVisible('permission-denied-message');
    await this.expectText('permission-message', 'Camera permission is required');
  }

  async openSettings() {
    await this.tapButton('open-settings-button');
  }

  async switchCamera() {
    await this.tapButton('switch-camera-button');
  }

  async toggleFlash() {
    await this.tapButton('flash-toggle-button');
  }

  async expectFlashOn() {
    await this.expectVisible('flash-on-indicator');
  }

  async expectFlashOff() {
    await this.expectVisible('flash-off-indicator');
  }

  async selectMultipleImages(count: number) {
    for (let i = 0; i < count; i++) {
      await this.tapButton(`select-image-${i}`);
    }
  }
}