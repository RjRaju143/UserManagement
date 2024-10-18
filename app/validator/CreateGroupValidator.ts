import { schema, rules } from '@adonisjs/validator';

export const CreateGroupValidator = schema.create({
  name: schema.string({ trim: true }, [
    rules.minLength(3),
    rules.maxLength(50),
  ]),
  isStatic: schema.boolean(),
  permissionsIds: schema.array().members(schema.number()),
});

export const UserByIdValidator = schema.create({
  id: schema.number([
    rules.unsigned(),
  ]),
});

export const UserUpdateValidator = schema.create({
  id: schema.number([
    rules.unsigned(),
  ]),
  username: schema.string({ trim: true }, [
    rules.minLength(3),
    rules.maxLength(50),
  ]),
  email: schema.string({}, [
    rules.email(),
  ]),
  isAdmin: schema.boolean(),
  firstname: schema.string({ trim: true }, [
    rules.minLength(1),
    rules.maxLength(50),
  ]),
  lastname: schema.string({ trim: true }, [
    rules.minLength(1),
    rules.maxLength(50),
  ]),
  phone: schema.string({}, [
    rules.mobile({ strict: true }),
  ]),
  gender: schema.string.optional(),
});

export const CreateUserValidator = schema.create({
  username: schema.string({ trim: true }, [
    rules.minLength(3),
    rules.maxLength(50),
  ]),
  password: schema.string({ trim: true }, [
    rules.minLength(8),
    rules.maxLength(50),
  ]),
  email: schema.string({ trim: true }, [
    rules.email(),
    rules.minLength(8),
    rules.maxLength(50),
  ]),
  isAdmin: schema.boolean.optional(),
  firstname: schema.string({ trim: true }, [
    rules.minLength(2),
    rules.maxLength(50),
  ]),
  lastname: schema.string({ trim: true }, [
    rules.minLength(2),
    rules.maxLength(50),
  ]),
  phone: schema.number([
    rules.minLength(10),
    rules.maxLength(10),
  ]),
  gender: schema.string({ trim: true }, [
    rules.minLength(4),
    rules.maxLength(6),
  ]),
  groupIds: schema.array().members(schema.number()),
});

export const UserLoginValidator = schema.create({
  email: schema.string.optional({}, [
    rules.email(),
  ]),
  username: schema.string.optional({ trim: true }, [
    rules.minLength(2),
    rules.maxLength(50),
  ]),
  password: schema.string({ trim: true }, [
    rules.minLength(8),
    rules.maxLength(50),
  ]),
})

export const RefreshTokenValidator = schema.create({
  refresh: schema.string(),
})

export const UserGroupByIdValidator = schema.create({
  name: schema.string({ trim: true }, [
    rules.minLength(3),
    rules.maxLength(50),
  ]),
  permission_ids: schema.array().members(schema.number()),
})

// { name, isStatic, permissionsIds }
// create