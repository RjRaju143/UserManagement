export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  isAdmin?: boolean;
  firstname: string;
  lastname: string;
  phone: number;
  gender: string;
  groupIds: number[];
}

export interface CreateUserResponse {
  status: number;
  username?: string;
  email?: string;
  isAdmin?: boolean;
  firstname?: string;
  lastname?: string;
  phone?: number;
  gender?: string | null;
  groups?: { id: number; name: string }[];
  group_ids?: number[];
  message?: string;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface GetAllUsersResponse {
  status: number;
  results?: Array<{}>;
  message?: any;
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  isAdmin?: boolean;
  firstname: string;
  lastname: string;
  phone: number;
  gender: Gender;
  groupIds: any;
  isDelete: boolean;
}

export interface LoginResponse {
  status: number;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface SuperUserRequest {
  username: string;
  password: string;
}

export interface SuperUserResponce {
  status: number;
  message: string;
}

export interface User {
  id?: any;
  isAdmin: boolean;
  isSuperuser: boolean;
}

export type UserPermissions = string[];

export interface getGroupByIdResponse {
  status: number;
  message?: string;
  id?: number;
  name?: string;
  permissions?: any;
  reporting_to_id?: any;
  groupdetails?: any;
}

export interface getGroupsResponse {
  status: number;
  message?: string;
  results?: unknown;
  id?: number;
}

export type UpdateResponse = any;

export interface UserResponce {
  id?: number;
  username?: string;
  password?: string;
  email?: string;
  isAdmin?: boolean;
  isSuperuser?: boolean;
  isStaff?: boolean;
  isGuest?: boolean;
  isDefaultPassword?: boolean;
  firstname?: string;
  lastname?: string;
  phone?: number;
  otp?: number | null;
  latitude?: string;
  longitude?: string;
  gender?: string | null,
  isEmailVerified?: boolean;
  isActive?: boolean;
  isPhoneVerified?: boolean;
  userType?: string;
  lastLogin?: string | null;
  deviceAccess?: string | null,
  address?: string | null,
  pincode?: number | null;
  erpCode?: number | null;
  erpId?: number | null;
  isDelete?: boolean;
}
