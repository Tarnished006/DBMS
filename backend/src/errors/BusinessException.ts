import { ERROR_CODES, ErrorCodeKey } from './ErrorCode.js';

export class BusinessException extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly validationErrors?: Array<{ field: string; code: string; message: string }>;

  constructor(
    errorCode: ErrorCodeKey,
    customMessage?: string,
    validationErrors?: Array<{ field: string; code: string; message: string }>
  ) {
    const errorDef = ERROR_CODES[errorCode] || ERROR_CODES.ERR_INTERNAL_SERVER_ERROR;
    super(customMessage || errorDef.defaultMessage);
    this.name = 'BusinessException';
    this.code = errorDef.code;
    this.status = errorDef.status;
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, BusinessException.prototype);
  }
}
