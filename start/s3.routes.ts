import '@adonisjs/core/services/router'
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const S3Controller = () => import('../app/s3/controllers/s3.controller.js')

router
  .group(() => {
    router.get('/list', [S3Controller, 'listAllObjects']).use(middleware.authenticate()) //.use(middleware.permissions()) /// `/list?page=1&maxBuckets=1`
    router
      .get('/list-buckets', [S3Controller, 'listBuckets'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .get('/upload-success', [S3Controller, 'objectsUploadSuccess'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .get('/upload-failed', [S3Controller, 'objectsUploadFailed'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .get('/list-buckets/:bucketName', [S3Controller, 'listBucketObjects'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
  })
  .prefix('/api/s3')
