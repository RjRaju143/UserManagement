import { schema, rules } from '@adonisjs/validator';

export const CreateGroupValidator = schema.create({
  name: schema.string({ trim: true }, [
    rules.minLength(3),
    rules.maxLength(50),
  ]),
  isStatic: schema.boolean(),
  permissionsIds: schema.array().members(
    schema.number()
  ),
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
  phone: schema.string.optional({}, [
    rules.mobile({ strict: true }),
  ]),
  gender: schema.string.optional(),
});

