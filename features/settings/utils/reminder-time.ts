const MINUTES_PER_DAY = 24 * 60;
const BASE_MONDAY_UTC = Date.UTC(1970, 0, 5);

type ReminderTime = {
  dayOfWeek: number;
  time: string;
};

function parseTime(time: string): [number, number, number] {
  const [hours, minutes, seconds = "0"] = time.split(":");
  return [Number(hours), Number(minutes), Number(seconds)];
}

function mondayBasedDay(day: number): number {
  return (day + 6) % 7;
}

function formatTime(date: Date): string {
  return date.toISOString().slice(11, 19);
}

export function localReminderToUtc(
  dayOfWeek: number,
  time: string,
  utcOffsetMinutes: number,
): ReminderTime {
  const [hours, minutes, seconds] = parseTime(time);
  const localMinutes =
    dayOfWeek * MINUTES_PER_DAY + hours * 60 + minutes;
  const localDate = new Date(
    BASE_MONDAY_UTC +
      (localMinutes * 60 + seconds) * 1000 -
      utcOffsetMinutes * 60 * 1000,
  );

  return {
    dayOfWeek: mondayBasedDay(localDate.getUTCDay()),
    time: formatTime(localDate),
  };
}

export function utcReminderToLocal(
  dayOfWeek: number,
  time: string,
  utcOffsetMinutes: number,
): ReminderTime {
  const [hours, minutes, seconds] = parseTime(time);
  const utcDate = new Date(
    BASE_MONDAY_UTC +
      ((dayOfWeek * 24 + hours) * 60 + minutes) * 60 * 1000 +
      seconds * 1000 +
      utcOffsetMinutes * 60 * 1000,
  );

  return {
    dayOfWeek: mondayBasedDay(utcDate.getUTCDay()),
    time: formatTime(utcDate).slice(0, 5),
  };
}
