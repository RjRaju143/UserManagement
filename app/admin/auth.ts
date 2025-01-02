import { DefaultAuthProvider } from 'adminjs'
import { AppDataSource } from '#config/database';
import { verifyPassword } from "../helper/index.js";
import componentLoader from './component_loader.js'
import { AuthUser } from '../User/models/index.js';

export const userExist = async (identifier: string | undefined, password: string) => {
  const user = await AppDataSource.manager.findOne(AuthUser, {
    where: [{ username: identifier }, { email: identifier }]
  });
  if (!user || user.isDelete) {
    return false
  }
  const isPasswordValid = await verifyPassword(user.password, user.salt, password);
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
    if (user.isSuperuser) {
      return { username: user.username, email: user.email, password: user.password };
    }
    return null;
  },
});

export default provider;
