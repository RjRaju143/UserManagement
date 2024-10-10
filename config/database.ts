import "reflect-metadata"
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
import { DataSource } from "typeorm"
import { AuthGroup, AuthGroupPermissions, AuthPermission, AuthUser, UserGroup, AuthToken } from "#models/index"

const dbCredentials = {
  host: env.get('DB_HOST'),
  port: Number(env.get('DB_PORT')),
  username: env.get('DB_USER') as string,
  password: env.get('DB_PASS') as string,
  database: env.get('DB_NAME') as string,
}

const db: any = {
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: dbCredentials,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
}

export const AppDataSource = new DataSource({
  type: "postgres",
  ...dbCredentials,
  logging: env.get('DEBUG'),
  entities: [AuthGroup, AuthPermission, AuthGroupPermissions, AuthUser, UserGroup, AuthToken],
  subscribers: [],
  synchronize: env.get('DEBUG'),
})

const dbConfig = defineConfig(db)
export default dbConfig


