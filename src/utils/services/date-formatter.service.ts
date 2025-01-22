import { Injectable } from '@nestjs/common';

@Injectable()
export class DateFormatterService {
  public static formatToLocalDateAndAndMinusOneMinute(dateToFormat: Date): {
    date: string;
    time: string;
  } {
    const formattedDate = dateToFormat.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const [month, day, year] = formattedDate.split('/');
    const date = `${day}/${month}/${year}`;

    const time = new Date(
      dateToFormat.getTime() - 60 * 1000,
    ).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      date,
      time,
    };
  }
}
