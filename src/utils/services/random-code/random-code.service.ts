import { CalculatorService } from '../calculator.service';

export abstract class RandomCodeGeneratorService {
  abstract generate(): string;

  abstract generateMany(number: number): string[];
}

export class RandomCodeGeneratorByShuffleArray
  implements RandomCodeGeneratorService
{
  private numAndCharSet: string[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
  ];
  private onlyCharSet: string[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];
  private codeLength: number = 6;
  private onlyLetterLength: number = 2;
  public generate(): string {
    const numToMinusDefaultToMakeOnlyTwoLetter = CalculatorService.minus(
      this.codeLength,
      this.onlyLetterLength,
    );
    const firstTwoLetter = this.pickNRandomChars(
      CalculatorService.minus(
        this.codeLength,
        numToMinusDefaultToMakeOnlyTwoLetter,
      ),
      this.onlyCharSet,
    );
    const lastFourLetter = this.pickNRandomChars(
      CalculatorService.minus(this.codeLength, this.onlyLetterLength),
      this.numAndCharSet,
    );
    return [...firstTwoLetter, ...lastFourLetter].join('');
  }

  public generateMany(number: number): string[] {
    const codeArr: string[] = [];
    const codeSet: Set<string> = new Set<string>();
    for (let i = 1; i <= number; i++) {
      let newCode = this.generate();
      if (!newCode || codeSet.has(newCode)) {
        while (codeSet.has(newCode)) {
          newCode = this.generate();
        }
      }
      codeSet.add(newCode);
      codeArr.push(newCode);
    }
    return codeArr;
  }

  private shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private pickNRandomChars(numberOfChar: number, array: string[]): string[] {
    return this.shuffleArray(array).slice(0, numberOfChar);
  }
}
