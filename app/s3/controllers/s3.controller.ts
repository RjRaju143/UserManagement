import type { HttpContext } from '@adonisjs/core/http'
import { s3 } from '#config/drive'
import S3Service from '../service/s3.service.js'

export default class S3Controller {
  constructor() {}

  /**
   * @listBuckets
   * @operationId listBuckets
   * @description get all buckets list.
   * @responseBody 200 - [{"Name": "String","CreationDate": "String"},{"Name": "String","LastModified": "String"}]
   * @paramUse(sortable, filterable)
   */
  public async listBuckets({ request, response }: HttpContext) {
    try {
      const { user, userPermissions } = request
      const result = await S3Service.listBuckets(user, userPermissions)
      return response.status(result.status).json(result.message)
    } catch (error: unknown) {
      console.error(error)
      return response.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
  }

  /**
   * @listBucketObjects
   * @operationId listBucketObjects
   * @description get objects list.
   * @responseBody 200 - [{"Key": "String","LastModified":"String"},{"Key": "String","LastModified":"String"}]
   * @paramUse(sortable, filterable)
   */
  public async listBucketObjects({ request, response, params }: HttpContext) {
    try {
      const { user, userPermissions } = request
      const bucketName = params.bucketName

      const result = await S3Service.listObjectsFromBucket(user, userPermissions, bucketName)
      return response.status(result.status).json(result.message)
    } catch (error: unknown) {
      console.error(error)
      return response.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
  }

  /**
   * @objectsUploadSuccess
   * @operationId objectsUploadSuccess
   * @description get success objects list.
   * @responseBody 200 - [{"BucketName": "String","Objects": [{"Key": "String","LastModified": "String"}]},{"BucketName": "String","Objects": [{"Key": "String","LastModified": "String"}]}]
   * @paramUse(sortable, filterable)
   */
  public async objectsUploadSuccess({ request, response }: HttpContext) {
    try {
      const { user, userPermissions } = request
      const result = await S3Service.objectsUploadSuccess(user, userPermissions)
      return response.status(result.status).json(result.message)
    } catch (error: unknown) {
      console.error(error)
      return response.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
  }

  /**
   * @objectsUploadFailed
   * @operationId objectsUploadFailed
   * @description get failed bucket list.
   * @responseBody 200 - [{"BucketName": "String","Objects": []},{"BucketName": "String","Objects": []}]
   * @paramUse(sortable, filterable)
   */
  public async objectsUploadFailed({ request, response }: HttpContext) {
    try {
      const { user, userPermissions } = request
      const result = await S3Service.objectsUploadFailed(user, userPermissions)
      return response.status(result.status).json(result.message)
    } catch (error: unknown) {
      console.error(error)
      return response.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
  }

  /**
   * @listAllObjects
   * @operationId listAllObjects
   * @description get success objects list.
   * @responseBody 200 - {"Buckets": [{"BucketName": "String","Objects": [{"Key": "String","LastModified": "String"}]}],"Pagination": {"currentPage": "number","maxBuckets": "number","totalBuckets": "number"}}
   * @paramUse(sortable, filterable)
   */
  public async listAllObjects({ response, request }: HttpContext) {
    try {
      const page = parseInt(request.input('page')) || 1
      const maxBuckets = parseInt(request.input('maxBuckets')) || 10
      const data = await s3.listBuckets().promise()
      const buckets = data.Buckets || []
      const paginatedBuckets = buckets.slice((page - 1) * maxBuckets, page * maxBuckets)
      const bucketDetailsPromises = paginatedBuckets.map(async (bucket) => {
        if (!bucket.Name) {
          return null
        }

        try {
          const objectsData = await s3.listObjectsV2({ Bucket: bucket.Name }).promise()
          const objectsWithTimestamp = (objectsData.Contents || []).map((obj) => ({
            Key: obj.Key,
            LastModified: obj.LastModified ? new Date(obj.LastModified) : null,
          }))

          return {
            BucketName: bucket.Name,
            Objects: objectsWithTimestamp,
          }
        } catch (error: unknown) {
          console.error(`Error fetching objects from bucket ${bucket.Name}:`, error)
          return null
        }
      })
      const bucketDetails = (await Promise.all(bucketDetailsPromises)).filter((b) => b !== null)
      return response.status(200).json({
        Buckets: bucketDetails,
        Pagination: {
          currentPage: page,
          maxBuckets: maxBuckets,
          totalBuckets: buckets.length,
        },
      })
    } catch (error: unknown) {
      console.error(error)
      return response.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
  }
}
