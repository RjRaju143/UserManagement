/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

router.get('/docs', async () => {
  try {
    const swaggerYaml = await AutoSwagger.default.docs(router.toJSON(), swagger)
    const filePath = path.join(__dirname, '../swagger.yml')
    fs.writeFileSync(filePath, swaggerYaml, 'utf8')
    return swaggerYaml
  } catch (error) {
    console.error('Error generating Swagger docs:', error)
    return { message: 'Internal Server Error' }
  }
})

// Renders Swagger-UI and passes YAML-output of /swagger
// router.get("/swagger", async () => {
//   return AutoSwagger.default.ui("/docs", swagger);
// });

router.get('/scalar', async () => {
  return AutoSwagger.default.scalar('/docs')
})

router.get('/rapidoc', async () => {
  return AutoSwagger.default.rapidoc('/docs', 'read') //to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
})
