/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts']
    }
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [
        {
          host: 8081,
          device: 8081
        }
      ]
    }
  },
  devices: {
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    }
  },
  configurations: {
    'android.emu.debug': {
      device: 'attached',
      app: 'android.debug'
    }
  }
};