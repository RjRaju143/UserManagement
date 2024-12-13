import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'

export default class ImageService {
  /**
   * Handle the image upload and return the file URL
   * @param image - The image file from the request
   * @returns {Promise<{url: string}>} - The URL of the uploaded file
   */
  public static async uploadImage(image: any) {
    try {
      const key = `s3/${image.clientName}-${cuid()}.${image.extname}`
      await image.moveToDisk(key)
      const fileUrl = await drive.use().getUrl(key)
      return { url: fileUrl }
    } catch (error) {
      throw new Error('Error uploading image')
    }
  }
}
