import "reflect-metadata"
import { DataSource } from "typeorm"
// import { AuthUser } from "../entity/User.js"
import { AuthGroup } from "../entity/AuthGroup.js"
import { AuthPermission } from "../entity/AuthPermission.js"
import { AuthGroupPermissions } from "../entity/Auth_group_Permissions.js"
import { AuthUser } from "../entity/User.js"
import { UserGroup } from "../entity/UserGroup.js"

import env from '#start/env'

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.get('DB_HOST'),
    port: env.get('DB_PORT'),
    username: env.get('DB_USER'),
    password: env.get('DB_PASS'),
    database: env.get('DB_NAME'),
    logging: env.get('DEBUG'),
    entities: [AuthGroup, AuthPermission, AuthGroupPermissions, AuthUser, UserGroup],
    subscribers: [],
    synchronize: env.get('DEBUG'),
})

AppDataSource.initialize().then(async () => {
    console.log("db connected !...")
}).catch(error => { console.log(error); process.exit(1) })
