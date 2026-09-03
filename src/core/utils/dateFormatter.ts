export class DateFormatter {
  static formatShortDate(date: Date, locale: string = 'en'): string {
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const monthsEn = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthsEl = [
        'Ιαν',
        'Φεβ',
        'Μαρ',
        'Απρ',
        'Μαΐ',
        'Ιουν',
        'Ιουλ',
        'Αυγ',
        'Σεπ',
        'Οκτ',
        'Νοε',
        'Δεκ',
      ];

      const months = locale === 'el' ? monthsEl : monthsEn;
      const month = months[date.getMonth()] || monthsEn[date.getMonth()];
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch {
      return date.toDateString();
    }
  }
}
