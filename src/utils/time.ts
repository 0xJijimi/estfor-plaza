export const getHoursBetweenDates = (date1: Date, date2: Date) => {
    const diffInMilliseconds = Math.abs(date2.valueOf() - date1.valueOf())
    return diffInMilliseconds / (1000 * 60 * 60)
}

export const formatDate = (ms: string) => {
    const date = new Date(parseInt(ms) * 1000)
    return date.toLocaleDateString()
}

export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))
