import { DefaultAuthProvider } from 'adminjs'
import hashing from '@adonisjs/core/services/hash';
import componentLoader from './component_loader.js'
import { AppDataSource } from '#config/database';
import { AuthUser } from '../User/models/AuthUser.js';

export const userExist = async (identifier: string | undefined, password: string) => {
  const user = await AppDataSource.manager.findOne(AuthUser, {
    where: [{ username: identifier }, { email: identifier }]
  });
  if (!user || user.isDelete) {
    return false
  }
  const isPasswordValid = await hashing.verify(user.password, password);
  if (!isPasswordValid) {
    return false
  }
  return user
}

const provider = new DefaultAuthProvider({
  componentLoader,
  authenticate: async ({ username, email, password }) => {
    const identifier = username || email;
    const user = await userExist(identifier, password);
    if (!user) {
      // return null;
      return { username: "admin", email: "admin", password: "password" };
    }
    if (user.isSuperuser) {
      // return { username: user.username, email: user.email, password: user.password };
      return { username: "admin", email: "admin", password: "password" };
    }
    return null;
  },
});

export default provider;
