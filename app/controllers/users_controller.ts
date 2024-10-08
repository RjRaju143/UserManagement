import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import { UserService } from '../service/users_service.js';
import { UserByIdValidator, UserUpdateValidator } from '#validator/CreateGroupValidator';

@inject()
export default class UsersController {
  constructor(private userService: UserService) { }

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
   * @operationId getAll
   * @description getAll user group.
   * @queryParam {string} [search] - Optional search term to filter users by username, email, firstname, or lastname.
   * @queryParam {number} [page] - Optional search term to filter page.
   * @queryParam {number} [page_size] - Optional search term to filter page_size.
   * @requestBody {"status": 200,"users": [{"id": "number","username": "string","email": "string@example.com","isAdmin": "boolean","isSuperuser": "boolean","isStaff": "boolean","isGuest": "boolean","isDefaultPassword": "boolean","firstname": "string","lastname": "string","phone": "number","otp": "null","latitude": "string","longitude": "string","gender": "male","isEmailVerified": "boolean","isActive": "boolean","isPhoneVerified": "boolean","userType": "string","lastLogin": "null","deviceAccess": "null","address": "string","pincode": "string","erpCode": "null","erpId": "null","groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}]}
   * @responseBody 200 - {"status": 200,"users": [{"id": "number","username": "string","email": "string@example.com","isAdmin": "boolean","isSuperuser": "boolean","isStaff": "boolean","isGuest": "boolean","isDefaultPassword": "boolean","firstname": "string","lastname": "string","phone": "number","otp": "null","latitude": "string","longitude": "string","gender": "string","isEmailVerified": "boolean","isActive": "boolean","isPhoneVerified": "boolean","userType": "string","lastLogin": "null","deviceAccess": "null","address": "string","pincode": "number","erpCode": "null","erpId": "null","groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}]}
  * @paramUse(sortable, filterable)
   */
  public async getAll({ request, response }: HttpContext) {
    const { search, page = '1', page_size = '10' } = request.qs();

    const searchTerm = Array.isArray(search) ? search[0] : search;

    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedPageSize = parseInt(page_size as string, 10) || 10;

    try {
      const result = await this.userService.getAll(
        request.user,
        request.userPermissions,
        searchTerm,
        parsedPage,
        parsedPageSize
      );
      return response.status(result.status).json(result);
    } catch (error) {
      console.error('Error in getAll controller method:', error);
      return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
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
    const validatedData = await request.validate({
      schema: UserByIdValidator,
      data: { id: Number(id) },
    });
    const result = await this.userService.getById(validatedData.id, request.user, request.userPermissions);
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
      return response.status(422).json({ message: error.messages });
    }
    const { username, email, isAdmin, firstname, lastname, phone, gender, groupIds } = request.body();
    const result = await this.userService.update(id, { username, email, isAdmin, firstname, lastname, phone, gender, groupIds }, request.user, request.userPermissions);
    if (!result) {
      return response.status(500).json({ message: "Internal Server Error" });
    }
    return response.status(result.status).json(result);
  }

  /**
   * @login
   * @operationId login
   * @description login a new user.
   * @requestBody {"username":"string","password":"string"}
   * @responseBody 201 - {"status": 201,"accessToken": "string","refreshToken": "string"}
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

  /**
   * @getGroups
   * @operationId getGroups
   * @description getGroups user group.
   * @queryParam {string} [search] - Optional search term to filter users by username, email, firstname, or lastname.
   * @queryParam {number} [page] - Optional search term to filter page.
   * @queryParam {number} [page_size] - Optional search term to filter page_size.
   * @responseBody 200 - {"results": [{"id": "number","name": "string","permission_ids": ["number"],"reporting_to": "string","isStatic": "boolean","is_delete": "boolean"}]}
   * @paramUse(sortable, filterable)
  */
  public async getGroups({ request, response }: HttpContext) {
    const { search, page = '1', page_size = '10' } = request.qs();
    const searchTerm = Array.isArray(search) ? search[0] : search;
    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedPageSize = parseInt(page_size as string, 10) || 10;
    try {
      const result = await this.userService.getGroups(
        request.user,
        request.userPermissions,
        searchTerm,
        parsedPage,
        parsedPageSize
      );
      return response.status(200).json(result);
    } catch (error) {
      console.error('Internal Server Error', error);
      return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
  }

  // TODO:
  // /**
  //  * @getById
  //  * @operationId getByIdUserGroup
  //  * @description getById user group.
  //  * @requestBody {"status": 200,"users": [{"id": "number","username": "string","email": "string@example.com","isAdmin": "boolean","isSuperuser": "boolean","isStaff": "boolean","isGuest": "boolean","isDefaultPassword": "boolean","firstname": "string","lastname": "string","phone": "number","otp": "null","latitude": "string","longitude": "string","gender": "male","isEmailVerified": "boolean","isActive": "boolean","isPhoneVerified": "boolean","userType": "string","lastLogin": "null","deviceAccess": "null","address": "string","pincode": "string","erpCode": "null","erpId": "null","groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}]}
  //  * @responseBody 200 - {"status": 200,"users": [{"id": "number","username": "string","email": "string@example.com","isAdmin": "boolean","isSuperuser": "boolean","isStaff": "boolean","isGuest": "boolean","isDefaultPassword": "boolean","firstname": "string","lastname": "string","phone": "number","otp": "null","latitude": "string","longitude": "string","gender": "string","isEmailVerified": "boolean","isActive": "boolean","isPhoneVerified": "boolean","userType": "string","lastLogin": "null","deviceAccess": "null","address": "string","pincode": "number","erpCode": "null","erpId": "null","groups": [{"id": "number","name": "string"}],"group_ids": ["number"]}]}
  //  * @paramUse(sortable, filterable)
  // */
  public async getGroupById({ params, request, response }: HttpContext) {
    const { id } = params;
    const validatedData = await request.validate({
      schema: UserByIdValidator,
      data: { id: Number(id) },
    });
    const result = await this.userService.getGroupById(validatedData.id, request.user, request.userPermissions);
    return response.status(201).json(result);
  }

}


