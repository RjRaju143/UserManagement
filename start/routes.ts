import router from '@adonisjs/core/services/router'

const UsersController = () => import('#controllers/users_controller')
const GroupController = () => import('#controllers/group_controller')

router.get('/api', async () => {
  return {
    message: 'hello World',
  }
})

router.post('/users/create', [UsersController, 'create'])

router.post('/group/create', [GroupController, 'createGroup'])

// router.get('/group/permissions', [GroupController, 'createPermissions'])

// router.get('/users/list', [UsersController, 'getAll'])

// router.get('/users/:id', [UsersController, 'getById'])

// router.put('/users/:id', [UsersController, 'update'])

// router.delete('/users/:id', [UsersController, 'delete'])

