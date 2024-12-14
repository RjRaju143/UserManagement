export interface TokenData {
  id?: number
  userType: string
}

export interface TokenResponce {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  status: number
  message?: string
  accessToken?: string
}
