export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  isAdmin: boolean;
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
  gender: string;
  groupIds: any;
}

export interface LoginResponse {
  status: number;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  email: string;
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

