import { AdminJSProviderConfig } from '@adminjs/adonis'
import AdminJS from "adminjs";
import { dark, light, noSidebar } from '@adminjs/themes'
import * as AdminJSTypeorm from "@adminjs/typeorm";
import componentLoader from '#admin/component_loader'
import authProvider from '#admin/auth'
import { AppDataSource } from "#config/database";
import { AuthUser, AuthGroup, AuthGroupPermissions, AuthPermission, AuthToken, UserGroup } from "../app/User/models/index.js"
import { hashPassword } from "../app/helper/index.js";

AppDataSource.initialize().then(async () => {
  console.info("db connected !...")
}).catch(error => {
  console.error(error);
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
    resources: [
      {
        resource: AuthUser,
        options: {
          actions: {
            new: {
              before: async (request: any) => {
                if (request.payload && request.payload.password) {
                  const { salt, hashedPassword } = await hashPassword(request.payload.password);
                  request.payload.salt = salt;
                  request.payload.password = hashedPassword;
                }
                return request;
              },
            },
            edit: {
              before: async (request: any) => {
                if (request.payload && request.payload.password) {
                  const userExist = await AppDataSource.manager.findOne(AuthUser, {
                    where: [
                      { username: request.payload.username },
                      { email: request.payload.email }
                    ]
                  });

                  if (!userExist || userExist.isDelete) {
                    console.log("status: 404, message: 'User not found'");
                    return { status: 404, message: 'User not found' };
                  }

                  if (request.payload.password !== userExist.password) {
                    const { salt, hashedPassword } = await hashPassword(request.payload.password);
                    request.payload.salt = salt;
                    request.payload.password = hashedPassword;
                  }
                }
                return request;
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
