import '@adonisjs/core/services/router'
import router from '@adonisjs/core/services/router'
import { middleware } from "#start/kernel"

const UsersController = () => import('#controllers/users_controller')
const PermissionsController = () => import('#controllers/permissions_controller')

router.group(() => {
  router.post('/su', [UsersController, 'su'])
  router.post('/login', [UsersController, 'login'])
  router.post('/token/refresh', [UsersController, 'refreshToken']).use(middleware.authenticate())
  router.delete('/logout', [UsersController, 'logout']).use(middleware.authenticate())
  router.post('/create', [UsersController, 'create']).use(middleware.authenticate()).use(middleware.permissions())
  router.get('/list', [UsersController, 'getAllUsers']).use(middleware.authenticate()).use(middleware.permissions())
  ////
  router.get('/groups', [UsersController, 'getGroups']).use(middleware.authenticate()).use(middleware.permissions())
  router.get('/apps/permissions', [PermissionsController, 'userpermissions']).use(middleware.authenticate())
  router.post('/groups', [UsersController, 'createGroup']).use(middleware.authenticate()).use(middleware.permissions())
  router.get('/groups/:id', [UsersController, 'getGroupById']).use(middleware.authenticate()).use(middleware.permissions())
  router.put('/groups/:id', [UsersController, 'updateGroupById']).use(middleware.authenticate()).use(middleware.permissions())
  router.get('/:id', [UsersController, 'getUserById']).use(middleware.authenticate()).use(middleware.permissions())
  router.put('/:id', [UsersController, 'updateUser']).use(middleware.authenticate()).use(middleware.permissions())
}).prefix('/api/users')

