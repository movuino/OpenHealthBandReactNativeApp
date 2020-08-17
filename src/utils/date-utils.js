const getDate = () => {
  const date = new Date();
  const day = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const year = `${date.getFullYear()}`;
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);
  const milliseconds = `00${date.getMilliseconds()}`.slice(-3);
  return { year, month, day, hours, minutes, seconds, milliseconds };
};

const getStringDate = () => {
  const d = getDate();
  return `${d.year}${d.month}${d.day}_${d.hours}${d.minutes}${d.seconds}${d.milliseconds}`;
}

export {
  getDate,
  getStringDate,
};