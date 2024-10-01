<!-- ### typeorm

npm install typeorm pg reflect-metadata

npm install typeorm reflect-metadata @types/node typescript

### migration
npx typeorm migration:run ----dataSource ./build/config/data-source.js

  "entities": ["src/entity/**/*.ts"],
  "migrations": ["src/migration/**/*.ts"],
  "cli": {
    "migrationsDir": "src/migration"
  },
  "synchronize": false // Make sure this is set to false to prevent automatic migrations
}

### static server

node ace add @adonisjs/static -->