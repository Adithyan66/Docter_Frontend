export type UserSummary = {
  id: string
  email: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginSuccessResponse = {
  success: true
  data: {
    accessToken: string
    refreshToken: string
    user: UserSummary
  }
  timestamp: string
  message: string
}

export type LoginErrorResponse = {
  success: false
  error: {
    code: string
    message: string
  }
  timestamp: string
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse

