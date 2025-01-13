import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Factory function to create a pipe that ensures at least one of the specified file fields is present.
 * @param requiredFields - Array of file field names to check.
 * @returns A PipeTransform instance.
 */
export function AtLeastOneFilePipe(requiredFields: string[]): PipeTransform {
  return {
    transform(files: any) {
      const hasAtLeastOne = requiredFields.some(
        (field) => files[field] && files[field].length > 0,
      );

      if (!hasAtLeastOne) {
        throw new BadRequestException(
          `At least one of the following files must be provided: ${requiredFields.join(
            ', ',
          )}.`,
        );
      }

      return files;
    },
  };
}
