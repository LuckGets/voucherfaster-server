import { Module } from '@nestjs/common';
import {
  RandomCodeGeneratorByShuffleArray,
  RandomCodeGeneratorService,
} from './random-code.service';

@Module({
  providers: [
    {
      provide: RandomCodeGeneratorService,
      useClass: RandomCodeGeneratorByShuffleArray,
    },
  ],
  exports: [RandomCodeGeneratorService],
})
export class RandomCodeGeneratorModule {}
