import env from '#start/env'
import app from '@adonisjs/core/services/app'
import AWS from 'aws-sdk'
import { defineConfig, services } from '@adonisjs/drive'

const s3Config = {
  accessKeyId: env.get('AWS_ACCESS_KEY_ID'),
  secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
  region: env.get('AWS_REGION'),
}

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),
  services: {
    fs: services.fs({
      location: app.makePath('media'),
      serveFiles: true,
      routeBasePath: '/media',
      visibility: 'public',
    }),
    s3: services.s3({
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      region: s3Config.region,
      bucket: env.get('S3_BUCKET'),
      visibility: 'public',
    }),
  },
})

export const s3 = new AWS.S3(s3Config)

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
