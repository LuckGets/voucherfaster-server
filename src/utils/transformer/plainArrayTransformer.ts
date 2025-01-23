import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

export function plainArrayTransformer<T>(
  data: string,
  instance: new () => T,
): T[] {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        throw new BadRequestException(
          'Expected an field value to be an array.',
        );
      }
      return parsed.map((item) => plainToInstance(instance, item));
    } catch (error) {
      throw new BadRequestException(`Invalid JSON format for ${instance.name}`);
    }
  }
  return data;
}
