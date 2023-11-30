export const getHoursBetweenDates = (date1: Date, date2: Date) => {
    const diffInMilliseconds = Math.abs(date2.valueOf() - date1.valueOf());
    return diffInMilliseconds / (1000 * 60 * 60);
}