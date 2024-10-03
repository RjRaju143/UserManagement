import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import { UserService } from '../service/users_service.js';
import { UserByIdValidator, UserUpdateValidator } from '../validator/CreateGroupValidator.js';

@inject()
export default class UsersController {
  constructor(private userService: UserService) { }

  /**
   * @create
   * @operationId createUserGroup
   * @description Creates a new user group with specified permissions.
   * @requestBody {"username":"string", "password":"string", "email":"string", "isAdmin":"boolean", "firstname":"string", "lastname":"string", "phone":"number", "gender":"string", "groupIds":["numbers"]}
   * @responseBody 201 - {"username":"string", "password":"string", "email":"string@gmil.com", "isAdmin":"false", "firstname":"string", "lastname":"string", "phone":"number", "gender":"male", "groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}
   * @paramUse(sortable, filterable)
  */
  public async create({ request, response }: HttpContext) {
    const { username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds } = request.body();
    const result = await this.userService.create(username, password, email, isAdmin, firstname, lastname, phone, gender, groupIds);
    return response.status(result.status).json(result);
  }

  /**
   * @getAll
   * @operationId getAllUserGroup
   * @description getAll user group.
   * @responseBody 200 - {"status": 200,"users": [{"id": 1,"username": "2werf234gs","email": "di25fsgvg@iadasdosgh.com","isAdmin": false,"isSuperuser": false,"isStaff": false,"isGuest": false,"isDefaultPassword": false,"firstname": "iya3sfsf25fddffdg","lastname": "zad25sffdk","phone": "9874519613","otp": "null","latitude": "0.000000","longitude": "0.000000","gender": "male","isEmailVerified": false,"isActive": false,"isPhoneVerified": false,"userType": "null","lastLogin": "null","deviceAccess": "null","address": "null","pincode": 0,"erpCode": "null","erpId": "null","groups": [{"id": 1,"name": "marvel"}],"group_ids": [1]}]}
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
   * @requestBody {"status": 200,"users": [{"id": 1,"username": "2werf234gs","email": "di25fsgvg@iadasdosgh.com","isAdmin": false,"isSuperuser": false,"isStaff": false,"isGuest": false,"isDefaultPassword": false,"firstname": "iya3sfsf25fddffdg","lastname": "zad25sffdk","phone": "9874519613","otp": "null","latitude": "0.000000","longitude": "0.000000","gender": "male","isEmailVerified": false,"isActive": false,"isPhoneVerified": false,"userType": "null","lastLogin": "null","deviceAccess": "null","address": "null","pincode": 0,"erpCode": "null","erpId": "null","groups": [{"id": 1,"name": "marvel"}],"group_ids": [1]}]}
   * @responseBody 200 - {"status": 200,"users": [{"id": 1,"username": "2werf234gs","email": "di25fsgvg@iadasdosgh.com","isAdmin": false,"isSuperuser": false,"isStaff": false,"isGuest": false,"isDefaultPassword": false,"firstname": "iya3sfsf25fddffdg","lastname": "zad25sffdk","phone": "9874519613","otp": "null","latitude": "0.000000","longitude": "0.000000","gender": "male","isEmailVerified": false,"isActive": false,"isPhoneVerified": false,"userType": "null","lastLogin": "null","deviceAccess": "null","address": "null","pincode": 0,"erpCode": "null","erpId": "null","groups": [{"id": 1,"name": "marvel"}],"group_ids": [1]}]}
   * @paramUse(sortable, filterable)
   */
  public async getById({ params, request, response }: HttpContext) {
    const { id } = params;
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
   * @responseBody 201 - {"username":"string", "password":"string", "email":"string@gmil.com", "isAdmin":"false", "firstname":"string", "lastname":"string", "phone":"number", "gender":"male", "groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}
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
    const result = await this.userService.update(id, username, email, isAdmin, isStaff, isGuest, firstname, lastname, phone, gender, isActive, userType);
    if (result.status === 404) {
      return response.status(404).json({ message: 'User not found' });
    }
    return response.status(result.status).json(result);
  }
}
