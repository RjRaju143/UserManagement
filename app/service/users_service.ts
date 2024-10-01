import { AppDataSource } from "../../config/data-source.js";
import { AuthGroup } from "../../entity/AuthGroup.js";
import { AuthUser } from "../../entity/User.js";
import { UserGroup } from "../../entity/UserGroup.js";
import { PasswordService } from "./passwordhashing.js"

export class UserService {
  async create(username: string, password: string, email: string, isAdmin: boolean, firstname: string, lastname: string, phone: number, gender: string, groupIds: number[]) {
    try {
      const hashedPassword = PasswordService.getPasswordHash(password);
      const userData = {
        username, password: hashedPassword, email, isAdmin, firstname, lastname, phone, gender,
      };

      const newUser = await AppDataSource.manager.create(AuthUser, userData);
      const newUserSavedData = await AppDataSource.manager.save(newUser);

      const userGroupsPromises = groupIds.map(async (groupId) => {
        const authGroup = await AppDataSource.manager.findOne(AuthGroup, { where: { id: groupId } });
        if (authGroup) {
          const userGroup = AppDataSource.manager.create(UserGroup, { group: authGroup, user: newUserSavedData });
          await AppDataSource.manager.save(userGroup);
          return { id: authGroup.id, name: authGroup.name };
        }
        console.error(`Group with id ${groupId} not found.`);
        return null;
      });

      const userGroups = await Promise.all(userGroupsPromises);
      const validUserGroups = userGroups.filter(group => group !== null);

      return {
        status: 201,
        ...newUserSavedData,
        groups: validUserGroups,
        group_ids: validUserGroups.map(group => group.id),
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { status: 500, message: { message: 'Error creating user' } };
    }
  }

  // async getAll() {
  //   try {
  //     const users = await AppDataSource.manager.find(AuthUser);
  //     const usersWithoutPassword = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  //     return { status: 200, users: usersWithoutPassword };
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //     return { status: 500, message: 'Error fetching users' };
  //   }
  // }

  //// TODO
  async getAll() {
    try {
      const users = await AppDataSource.manager.find(AuthUser);

      const usersWithoutPassword = await Promise.all(users.map(async user => {
        const userGroups = await AppDataSource.manager.find(UserGroup, { where: { id: user.id }, relations: ['group'] });
        console.log('userGroups....', userGroups)

        const groups = userGroups.map(ug => ({
          id: ug.group.id,
          name: ug.group.name,
        }));

        const { password, ...userWithoutPassword } = user;

        return {
          ...userWithoutPassword,
          groups,
          group_ids: groups.map(group => group.id),
        };
      }));

      return { status: 200, users: usersWithoutPassword };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { status: 500, message: 'Error fetching users' };
    }
  }
}


// async getById(userId: number) {
//   try {
//     const user = await AppDataSource.manager.findOneBy(AuthUser, { id: userId })
//     if (!user) {
//       return { status: 404, message: 'User not found' }
//     }
//     return { status: 200, user }
//   } catch (error) {
//     console.error('Error fetching user by ID:', error);
//     return { status: 404, message: 'Error fetching user by ID' }
//   }
// }

// async update(userId: number, firstName: string, lastName: string, age: number) {
//   try {
//     const result = await AppDataSource.manager.update(AuthUser, userId, {
//       firstName, lastName, age
//     })
//     if (result.affected === 0) {
//       return { status: 404, message: 'User not found' };
//     }

//     return { status: 200, message: 'User updated successfully' };

//   } catch (error) {
//     console.error('Error updating user:', error);
//     return { status: 500, message: 'Error updating user' };
//   }
// }

// async delete(userId: number) {
//   try {
//     const result = await AppDataSource.manager.delete(AuthUser, userId);
//     if (result.affected === 0) {
//       return { status: 404, message: 'User not found' };
//     }
//     return { status: 200, message: 'User deleted successfully' };
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     return { status: 500, message: 'Error deleting user' };
//   }
// }


