import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import { UserService } from '../service/users_service.js';
import { UserByIdValidator, UserUpdateValidator } from '../validator/CreateGroupValidator.js';

@inject()
export default class UsersController {
  constructor(private userService: UserService) { }

  //// TODO: /// TODO: check permissions
  /**
   * @create
   * @operationId createUserGroup
   * @description Creates a new user group with specified permissions.
   * @requestBody {"username":"string", "password":"string", "email":"string", "isAdmin":"boolean", "firstname":"string", "lastname":"string", "phone":"number", "gender":"string", "groupIds":["numbers"]}
   * @responseBody 201 - {"username":"string", "password":"string", "email":"string@example.com", "isAdmin":"boolean", "firstname":"string", "lastname":"string", "phone":"number", "gender":"string", "groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}
   * @paramUse(sortable, filterable)
  */
  public async create({ request, response }: HttpContext) {
    const { username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds } = request.body();
    const result = await this.userService.create({ username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds }, request.user, request.userPermissions);
    return response.status(result.status).json(result);
  }

  /**
   * @getAll
   * @operationId getAllUserGroup
   * @description getAll user group.
   * @responseBody 200 - {"status": 200,"users": [{"id": "number","username": "string","email": "string@example.com","isAdmin": "boolean","isSuperuser": boolean,"isStaff": boolean,"isGuest": boolean,"isDefaultPassword": boolean,"firstname": "string","lastname": "string","phone": "number","otp": "null","latitude": "string","longitude": "string","gender": "string","isEmailVerified": "boolean","isActive": "boolean","isPhoneVerified": "boolean","userType": "string","lastLogin": "null","deviceAccess": "null","address": "string","pincode": "string","erpCode": "null","erpId": "null","groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}]}
   * @paramUse(sortable, filterable)
  */
  public async getAll({ response }: HttpContext) {
    const result = await this.userService.getAll();
    return response.status(result.status).json(result);
  }

  /**
   * @getById
   * @operationId getByIdUserGroup
   * @description getById user group.
   * @requestBody {"status": 200,"users": [{"id": "number","username": "string","email": "string@example.com","isAdmin": "boolean","isSuperuser": "boolean","isStaff": "boolean","isGuest": "boolean","isDefaultPassword": "boolean","firstname": "string","lastname": "string","phone": "number","otp": "null","latitude": "string","longitude": "string","gender": "male","isEmailVerified": "boolean","isActive": "boolean","isPhoneVerified": "boolean","userType": "string","lastLogin": "null","deviceAccess": "null","address": "string","pincode": "string","erpCode": "null","erpId": "null","groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}]}
   * @responseBody 200 - {"status": 200,"users": [{"id": "number","username": "string","email": "string@example.com","isAdmin": "boolean","isSuperuser": "boolean","isStaff": "boolean","isGuest": "boolean","isDefaultPassword": "boolean","firstname": "string","lastname": "string","phone": "number","otp": "null","latitude": "string","longitude": "string","gender": "string","isEmailVerified": "boolean","isActive": "boolean","isPhoneVerified": "boolean","userType": "string","lastLogin": "null","deviceAccess": "null","address": "string","pincode": "number","erpCode": "null","erpId": "null","groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}]}
   * @paramUse(sortable, filterable)
   */
  public async getById({ params, request, response }: HttpContext) {
    const { id } = params;

    const user = request.user;
    if (user.id !== parseInt(id)) {
      return response.status(403).json({ message: 'Forbidden' });
    }

    const validatedData = await request.validate({
      schema: UserByIdValidator,
      data: { id: Number(id) },
    });

    const result = await this.userService.getById(validatedData.id);
    if (result.status === 404) {
      return response.status(404).json({ message: 'User not found' });
    }
    return response.status(result.status).json(result);
  }

  /**
   * @update
   * @operationId updateUserGroup
   * @description Creates a new user group with specified permissions.
   * @requestBody {"username":"string", "email":"string", "isAdmin":"boolean", "firstname":"string", "lastname":"string", "phone":"number", "gender":"string", "groupIds":["numbers"]}
   * @responseBody 201 - {"username":"string", "password":"string", "email":"string@example.com", "isAdmin":"boolean", "firstname":"string", "lastname":"string", "phone":"number", "gender":"male", "groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}
   * @paramUse(sortable, filterable)
  */
  public async update({ params, request, response }: HttpContext) {
    const { id } = params;
    try {
      await request.validate({
        schema: UserUpdateValidator,
        data: {
          id: Number(id),
          ...request.body(),
        },
      });
    } catch (error) {
      return response.status(422).json({ errors: error.messages });
    }
    const { username, email, isAdmin, isStaff, isGuest, firstname, lastname, phone, gender, isActive, userType } = request.body();
    const result = await this.userService.update(id, { username, email, isAdmin, isStaff, isGuest, firstname, lastname, phone, gender, isActive, userType });
    if (result.status === 404) {
      return response.status(404).json({ message: 'User not found' });
    }
    return response.status(result.status).json(result);
  }

  /**
   * @login
   * @operationId login
   * @description login a new user.
   * @requestBody {"username":"string","password":"string"}
   * @responseBody 201 - {"status": 200,"accessToken": "string","refreshToken": "string"}
   * @paramUse(sortable, filterable)
  */
  public async login({ request, response }: HttpContext) {
    const { username, password, email } = request.body();
    const result = await this.userService.login({ username, password, email });
    return response.status(result.status).json(result);
  }

  /**
   * @su
   * @operationId su
   * @description new super user.
   * @requestBody {"username":"string","password":"string"}
   * @responseBody 201 - {"status": 200,"message": "string"}
   * @paramUse(sortable, filterable)
  */
  public async su({ request, response }: HttpContext) {
    const { username, password } = request.body();
    const result = await this.userService.su({ username, password });
    return response.status(result.status).json(result);
  }

  /**
   * @refreshToken
   * @operationId refreshToken
   * @description create a new accesstoken.
   * @requestBody {"refresh":"string"}
   * @responseBody 201 - {"status": 200,"accessToken": "string","refreshToken": "string"}
   * @paramUse(sortable, filterable)
  */
  public async refreshToken({ request, response }: HttpContext) {
    const { refresh } = request.body();
    const result = await this.userService.refreshToken(refresh);
    return response.status(result.status).json(result);
  }

  // /**
  //  * @changepassword
  //  * @operationId changepassword
  //  * @description changepassword for user.
  //  * @requestBody {"old_password":"string","password":"string"}
  //  * @responseBody 201 - {"status": 200,"updatedPassword": "string"}
  //  * @paramUse(sortable, filterable)
  // */
  // public async changepassword({ request, response }: HttpContext) {
  //   const { refresh } = request.body();
  //   const result = await this.userService.updatedPassword(refresh);
  //   return response.status(result.status).json(result);
  // }
}
