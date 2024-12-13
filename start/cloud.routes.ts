import '@adonisjs/core/services/router'
import router from '@adonisjs/core/services/router'
// import { cuid } from '@adonisjs/core/helpers'
// import drive from '@adonisjs/drive/services/main'

const CloudController = () => import('../app/cloud/controllers/cloud.controller.js')

router.group(() => {
    router.put('/upload', [CloudController, 'upload'])
}).prefix('/api/images')

// router.group(() => {
//   router.put('/upload', async ({ request, response }) => {
//     try {
//       const image = request.file('avatar', {
//         size: '2mb',
//         extnames: ['jpeg', 'jpg', 'png'],
//       })
//       if (!image) {
//         return response.badRequest({ error: 'Image missing' })
//       }
//       const key = `s3/${cuid()}.${image.extname}`
//       await image.moveToDisk(key)
//       return {
//         message: 'Image uploaded',
//         url: await drive.use().getUrl(key),
//       }
//     } catch (error: unknown) {
//       console.log(error)
//       return response.status(500).json({ status: 500, message: 'Internal Server Error' })
//     }
//   })
// }).prefix('/api/images')
