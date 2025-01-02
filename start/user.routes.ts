import '@adonisjs/core/services/router'
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UsersController = () => import('../app/User/controllers/users_controller.js')

router
  .group(() => {
    router.post('/login', [UsersController, 'login'])
    router
      .post('/create', [UsersController, 'create'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .get('/list', [UsersController, 'getUsers'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .get('/groups', [UsersController, 'getGroups'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .post('/groups', [UsersController, 'createGroup'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .get('/groups/:id', [UsersController, 'getGroupById'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .put('/groups/:id', [UsersController, 'updateGroupById'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .get('/:id', [UsersController, 'getUserById'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router
      .put('/:id', [UsersController, 'updateUser'])
      .use(middleware.authenticate())
      .use(middleware.permissions())
    router.post('/token/refresh', [UsersController, 'refreshToken']).use(middleware.authenticate())
    router.delete('/logout', [UsersController, 'logout']).use(middleware.authenticate())
  })
  .prefix('/api/users')
