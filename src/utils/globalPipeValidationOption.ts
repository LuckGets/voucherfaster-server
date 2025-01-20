import { HttpStatus, ValidationPipeOptions } from '@nestjs/common';

const globalPipeValidationOption: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  validateCustomDecorators: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
};

export default globalPipeValidationOption;
