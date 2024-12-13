import CloudService from '../service/cloud.service.js'
import type { HttpContext } from '@adonisjs/core/http';


export default class ImageController {
    public async upload({ request, response }: HttpContext) {
    try {
      const image = request.file('avatar', {
        size: '2mb',
        extnames: ['jpeg', 'jpg', 'png'],
      })
      if (!image) {
        return response.badRequest({ error: 'Image missing' })
      }
      const result = await CloudService.uploadImage(image)
      return {
        message: 'Image uploaded',
        url: result.url,
      }
    } catch (error) {
      console.log(error)
      return response.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
  }
}
