import { AdminJSProviderConfig } from '@adminjs/adonis'
import AdminJS from 'adminjs'
import { dark, light, noSidebar } from '@adminjs/themes'
import * as AdminJSTypeorm from '@adminjs/typeorm'
import componentLoader from '#admin/component_loader'
import authProvider from '#admin/auth'
import {
  AuthUser,
  AuthGroup,
  AuthGroupPermissions,
  AuthPermission,
  AuthToken,
  UserGroup,
} from '../app/User/models/index.js'
import { AppDataSource } from '#config/database'
import hashing from '@adonisjs/core/services/hash'

AppDataSource.initialize()
  .then(async () => {
    console.log('db connected !...')
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })

AdminJS.registerAdapter({
  Resource: AdminJSTypeorm.Resource,
  Database: AdminJSTypeorm.Database,
})

const adminjsConfig: AdminJSProviderConfig = {
  adapter: {
    enabled: false,
  },
  adminjs: {
    rootPath: '/admin',
    loginPath: '/admin/login',
    logoutPath: '/admin/logout',
    componentLoader,
    resources: [
      {
        resource: AuthUser,
        options: {
          actions: {
            new: {
              before: async (request: any) => {
                if (request.payload && request.payload.password) {
                  const hashedPassword = await hashing.make(request.payload.password)
                  request.payload.password = hashedPassword
                }
                return request
              },
            },
            edit: {
              before: async (request: any) => {
                if (request.payload && request.payload.password) {
                  const hashedPassword = await hashing.make(request.payload.password)
                  request.payload.password = hashedPassword
                }
                return request
              },
            },
          },
        },
      },
      AuthGroup,
      UserGroup,
      AuthPermission,
      AuthGroupPermissions,
      AuthToken,
    ],
    branding: {
      companyName: 'UserManagement',
      theme: {},
    },
    settings: {
      defaultPerPage: 10,
    },
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
  },
  auth: {
    enabled: true,
    provider: authProvider,
    middlewares: [],
  },
  middlewares: [],
}
export default adminjsConfig
