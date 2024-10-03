import router from '@adonisjs/core/services/router'

import { middleware } from "./kernel.js"

const UsersController = () => import('#controllers/users_controller')
const GroupController = () => import('#controllers/group_controller')


router.group(() => {
  router.post('/create', [UsersController, 'create'])
  router.get('/list', [UsersController, 'getAll'])
  router.get('/:id', [UsersController, 'getById'])
  router.put('/:id', [UsersController, 'update'])
  // router.delete('/users/:id', [UsersController, 'delete'])
}).prefix('/users').use(middleware.auth())

router.group(() => {
  router.post('/create', [GroupController, 'createGroup'])
  // router.get('/group/permissions', [GroupController, 'createPermissions'])
}).prefix('/group').use(middleware.auth())


