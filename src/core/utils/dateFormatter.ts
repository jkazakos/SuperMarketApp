export class DateFormatter {
  static formatShortDate(
    date: Date | string | number | null | undefined,
    locale: string = 'en'
  ): string {
    if (!date) return '';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) {
        return '';
      }

      const day = d.getDate().toString().padStart(2, '0');
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
      const month = months[d.getMonth()] || monthsEn[d.getMonth()];
      const year = d.getFullYear();

      return `${day} ${month} ${year}`;
    } catch {
      return '';
    }
  }
}
