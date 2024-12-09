import { DefaultAuthProvider } from 'adminjs'
import hashing from '@adonisjs/core/services/hash';
import componentLoader from './component_loader.js'
import { AppDataSource } from '#config/database';
import { SuperUser } from '../User/models/index.js';

export const userExist = async (identifier: string | undefined, password: string) => {
  const user = await AppDataSource.manager.findOne(SuperUser, {
    where: [{ username: identifier }]
  });
  if (!user) {
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
      return null;
    }
    return { username: user.username, email: user.username, password: user.password };
  },
});

export default provider;
