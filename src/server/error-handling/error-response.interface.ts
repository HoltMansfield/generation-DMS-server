import { HttpStatus } from './http-status.enum'

export interface ErrorResponse {
  error: string
  httpStatusCode: HttpStatus
  message: string | object
}
