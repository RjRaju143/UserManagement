import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entity/User.js"

import env from '#start/env'


export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.get('DB_HOST'),
    port: env.get('DB_PORT'),
    username: env.get('DB_USER'),
    password: env.get('DB_PASS'),
    database: env.get('DB_NAME'),
    synchronize: env.get('DEBUG'),
    logging: env.get('DEBUG'),
    entities: [User],
    migrations: [],
    subscribers: [],
})

AppDataSource.initialize().then(async () => {
    console.log("db connected !...")
}).catch(error => { console.log(error); process.exit(1) })
