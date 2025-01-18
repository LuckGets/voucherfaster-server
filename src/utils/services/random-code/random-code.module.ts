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
  exports: [],
})
export class RandomCodeGeneratorModule {}
