import { schema, rules } from '@adonisjs/validator'

export const CreateGroupValidator = schema.create({
  name: schema.string(),
  isStatic: schema.boolean(),
  permissionsIds: schema.array().members(schema.number()),
})

export const UserByIdValidator = schema.create({
  id: schema.number([rules.unsigned()]),
})

export const UserUpdateValidator = schema.create({
  id: schema.number([rules.unsigned()]),
  username: schema.string(),
  email: schema.string({}, [rules.email()]),
  isAdmin: schema.boolean(),
  firstname: schema.string(),
  lastname: schema.string(),
  phone: schema.string({}, [rules.mobile({ strict: true })]),
  gender: schema.string.optional(),
})

export const CreateUserValidator = schema.create({
  username: schema.string(),
  password: schema.string(),
  email: schema.string({}, [rules.email()]),
  isAdmin: schema.boolean.optional(),
  firstname: schema.string(),
  lastname: schema.string(),
  phone: schema.number(),
  gender: schema.string(),
  groupIds: schema.array().members(schema.number()),
})

export const UserLoginValidator = schema.create({
  email: schema.string.optional({}, [rules.email()]),
  username: schema.string.optional(),
  password: schema.string(),
})

export const RefreshTokenValidator = schema.create({
  refresh: schema.string(),
})

export const UserGroupByIdValidator = schema.create({
  name: schema.string(),
  permission_ids: schema.array().members(schema.number()),
})
