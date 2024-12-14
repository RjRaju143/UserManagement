export const getTodayAndYesterday = () => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  today.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)

  return { today, yesterday }
}
