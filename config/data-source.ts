import "reflect-metadata"
import { DataSource } from "typeorm"
// import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "typeormadonisjs",
    synchronize: true,
    logging: false,
    // entities: [User],
    entities: [],
    migrations: [],
    subscribers: [],
})

AppDataSource.initialize().then(async () => {
    console.log("db connected !...")
}).catch(error => { console.log(error); process.exit(1) })
