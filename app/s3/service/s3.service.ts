import { s3 } from '#config/drive'
import { getTodayAndYesterday } from '../helper/index.js'
import { User, UserPermissions } from '../../interfaces/index.js'

export default class S3Service {
  private static hasPermission(user: any, userPermissions: string[], permission: string) {
    return user.isSuperuser || user.isAdmin || userPermissions.includes(permission)
  }

  public static async listBuckets(user: User, userPermissions: UserPermissions) {
    if (this.hasPermission(user, userPermissions, 'view_buckets')) {
      try {
        const data = await s3.listBuckets().promise()
        return { status: 200, message: data.Buckets }
      } catch (error: unknown) {
        console.error(error)
        return { status: 500, message: 'Internal Server Error' }
      }
    }

    return { status: 403, message: 'Forbidden' }
  }

  public static async listObjectsFromBucket(
    user: User,
    userPermissions: UserPermissions,
    bucketName: string
  ) {
    try {
      if (this.hasPermission(user, userPermissions, 'view_bucket_objects')) {
        if (!bucketName) {
          return { status: 400, message: 'Bucket name is required' }
        }

        const objectsData = await s3.listObjectsV2({ Bucket: bucketName }).promise()

        if (!objectsData.Contents) {
          return { status: 200, message: [] }
        }

        const objectsWithTimestamp = objectsData.Contents.map((obj) => ({
          Key: obj.Key as string,
          LastModified: obj.LastModified ? new Date(obj.LastModified) : new Date(0),
        }))

        const sortedObjects = objectsWithTimestamp.sort(
          (a, b) => b.LastModified.getTime() - a.LastModified.getTime()
        )

        return { status: 200, message: sortedObjects }
      }

      return { status: 403, message: 'Forbidden' }
    } catch (error: unknown) {
      console.error(error)
      return { status: 500, message: 'Internal Server Error' }
    }
  }

  public static async objectsUploadSuccess(user: User, userPermissions: UserPermissions) {
    try {
      if (this.hasPermission(user, userPermissions, 'view_upload_success')) {
        const data = await s3.listBuckets().promise()
        const buckets = (data.Buckets || [])
          .filter((bucket: any) => bucket.Name)
          .map((bucket: any) => ({ Name: bucket.Name }))

        const { today, yesterday } = getTodayAndYesterday()

        if (!(today instanceof Date) || !(yesterday instanceof Date)) {
          console.log('Invalid dates for today or yesterday')
          return { status: 500, message: 'Internal Server Error' }
        }

        const bucketDetailsPromises = buckets.map(async (bucket) => {
          if (!bucket.Name) {
            return null
          }

          try {
            const objectsData = await s3.listObjectsV2({ Bucket: bucket.Name }).promise()

            const filteredObjects =
              objectsData.Contents?.filter((obj) => {
                const lastModified = obj.LastModified ? new Date(obj.LastModified) : new Date(0)
                const tomorrow = new Date(today)
                tomorrow.setDate(today.getDate() + 1)
                return lastModified >= yesterday && lastModified < tomorrow
              }) ?? []

            const objectsWithTimestamp = filteredObjects.map((obj) => ({
              Key: obj.Key as string,
              LastModified: obj.LastModified ? new Date(obj.LastModified) : new Date(0),
            }))

            const sortedObjects = objectsWithTimestamp.sort(
              (a, b) => b.LastModified.getTime() - a.LastModified.getTime()
            )

            if (sortedObjects.length > 0) {
              return { BucketName: bucket.Name, Objects: sortedObjects }
            }
            return null
          } catch (error: unknown) {
            if (error instanceof Error && error.message.includes('NoSuchBucket')) {
              console.warn(`Bucket ${bucket.Name} does not exist or is inaccessible.`)
              return null
            }
            console.error(`Error fetching objects from bucket ${bucket.Name}:`, error)
            return null
          }
        })
        const bucketDetails = (await Promise.all(bucketDetailsPromises)).filter((b) => b !== null)
        return {
          status: 200,
          message: bucketDetails,
        }
      }

      return { status: 403, message: 'Forbidden' }
    } catch (error: unknown) {
      console.error(error)
      console.error(error)
      return { status: 500, message: 'Internal Server Error' }
    }
  }

  public static async objectsUploadFailed(user: User, userPermissions: UserPermissions) {
    try {
      if (this.hasPermission(user, userPermissions, 'view_upload_failed')) {
        const data = await s3.listBuckets().promise()
        const buckets = data.Buckets || []
        let bucketDetails = []
        const { today, yesterday } = getTodayAndYesterday()
        const bucketDetailsPromises = buckets.map(async (bucket) => {
          if (!bucket.Name) {
            return null
          }

          try {
            const objectsData = await s3.listObjectsV2({ Bucket: bucket.Name }).promise()

            const filteredObjects = (objectsData.Contents || []).filter((obj) => {
              const lastModified = obj.LastModified ? new Date(obj.LastModified) : new Date(0)
              const tomorrow = new Date(today)
              tomorrow.setDate(today.getDate() + 1)
              return lastModified >= yesterday && lastModified < tomorrow
            })

            if (filteredObjects.length === 0) {
              return { BucketName: bucket.Name, Objects: [] }
            }
            return null
          } catch (error: unknown) {
            console.error(`Error fetching objects from bucket ${bucket.Name}:`, error)
            return null
          }
        })

        bucketDetails = (await Promise.all(bucketDetailsPromises)).filter((b) => b !== null)

        return {
          status: 200,
          message: bucketDetails,
        }
      }

      return { status: 403, message: 'Forbidden' }
    } catch (error: unknown) {
      console.error(error)
      return { status: 500, message: 'Internal Server Error' }
    }
  }
}
