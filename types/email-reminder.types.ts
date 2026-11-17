export type EmailReminder = {
  id: string;
  id_user: string;
  day_of_week: number;
  time: string;
};

export type EmailReminderInput = {
  day_of_week: number;
  time: string;
};

export type EmailReminderPatch = {
  day_of_week?: number;
  time?: string;
};
