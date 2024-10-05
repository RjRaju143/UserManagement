import '@adonisjs/core/services/router'
import router from '@adonisjs/core/services/router'
import { middleware } from "#start/kernel"

const UsersController = () => import('#controllers/users_controller')
const GroupController = () => import('#controllers/group_controller')

router.post('/users/login', [UsersController, 'login'])

router.post('/users/su', [UsersController, 'su'])

router.post('/token/refresh', [UsersController, 'refreshToken']).prefix('/users').use(middleware.authenticate())

router.group(() => {
  router.post('/create', [UsersController, 'create'])
  //// TODO:
  router.get('/list', [UsersController, 'getAll'])
  //// TODO:
  router.get('/:id', [UsersController, 'getById'])
  //// TODO:
  router.put('/:id', [UsersController, 'update'])
}).prefix('/users').use(middleware.authenticate()).use(middleware.permissions())

//// TODO:
router.group(() => {
  router.post('/create', [GroupController, 'createGroup'])
  router.get('/permissions', [GroupController, 'createPermissions'])
}).prefix('/group').use(middleware.authenticate())

