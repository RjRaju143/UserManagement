import { AdminJSProviderConfig } from '@adminjs/adonis'
import AdminJS from "adminjs";
import * as AdminJSTypeorm from "@adminjs/typeorm";
import componentLoader from '#admin/component_loader'
import authProvider from '#admin/auth'
import { AuthUser, AuthGroup, AuthGroupPermissions, AuthPermission, AuthToken, UserGroup } from "#models/index"
import { AppDataSource } from "#config/database";

AppDataSource.initialize().then(async () => {
  console.log("db connected !...")
}).catch(error => {
  console.log(error);
  process.exit(1);
})

AdminJS.registerAdapter({
  Resource: AdminJSTypeorm.Resource,
  Database: AdminJSTypeorm.Database,
});

const adminjsConfig: AdminJSProviderConfig = {
  adapter: {
    enabled: false,
  },
  adminjs: {
    rootPath: '/admin',
    loginPath: '/admin/login',
    logoutPath: '/admin/logout',
    componentLoader,
    resources: [AuthUser, AuthGroup, UserGroup, AuthPermission, AuthGroupPermissions, AuthToken],
    pages: {},
    locale: {
      availableLanguages: ['en'],
      language: 'en',
      translations: {
        en: {
          actions: {},
          messages: {},
          labels: {},
          buttons: {},
          properties: {},
          components: {},
          pages: {},
          ExampleResource: {
            actions: {},
            messages: {},
            labels: {},
            buttons: {},
            properties: {},
          },
        },
      },
    },
    branding: {
      companyName: 'AdminJS',
      theme: {},
    },
    settings: {
      defaultPerPage: 10,
    },
  },
  auth: {
    enabled: true,
    provider: authProvider,
    middlewares: [],
  },
  middlewares: [],
}
export default adminjsConfig
