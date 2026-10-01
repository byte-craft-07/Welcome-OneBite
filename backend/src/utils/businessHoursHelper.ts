import { IDaySchedule } from '../models/BusinessHours';

export interface OpenStatusResult {
  isOpen: boolean;
  statusText: string;
  nextStatusMessage: string;
  todayHours: string;
  currentDay: string;
}

const dayOrder: Array<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'> = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export const calculateOpenStatus = (
  days: IDaySchedule[],
  timezone = 'Asia/Kolkata'
): OpenStatusResult => {
  try {
    const now = new Date();
    // Format to current day and 24-hr time in business timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const weekdayPart = parts.find((p) => p.type === 'weekday')?.value?.toLowerCase() || 'monday';
    const hourPart = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minutePart = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

    const currentTimeInMinutes = hourPart * 60 + minutePart;

    // Find schedule for today
    const todaySchedule = days.find((d) => d.day.toLowerCase() === weekdayPart);

    if (!todaySchedule || !todaySchedule.isOpen) {
      // Find next opening day
      const currentDayIdx = dayOrder.indexOf(weekdayPart as any);
      let nextOpening = '';

      for (let i = 1; i <= 7; i++) {
        const nextIdx = (currentDayIdx + i) % 7;
        const nextDayName = dayOrder[nextIdx];
        const nextSched = days.find((d) => d.day.toLowerCase() === nextDayName);
        if (nextSched && nextSched.isOpen) {
          const capDay = nextDayName.charAt(0).toUpperCase() + nextDayName.slice(1);
          nextOpening = i === 1 ? `Opens tomorrow at ${format12Hr(nextSched.openTime)}` : `Opens ${capDay} at ${format12Hr(nextSched.openTime)}`;
          break;
        }
      }

      return {
        isOpen: false,
        statusText: 'Closed Today',
        nextStatusMessage: nextOpening || 'Closed',
        todayHours: 'Closed',
        currentDay: weekdayPart,
      };
    }

    const [openH, openM] = todaySchedule.openTime.split(':').map(Number);
    const [closeH, closeM] = todaySchedule.closeTime.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const formattedTodayHours = `${format12Hr(todaySchedule.openTime)} – ${format12Hr(todaySchedule.closeTime)}`;

    if (currentTimeInMinutes >= openMinutes && currentTimeInMinutes < closeMinutes) {
      return {
        isOpen: true,
        statusText: 'Open Now',
        nextStatusMessage: `Closes at ${format12Hr(todaySchedule.closeTime)}`,
        todayHours: formattedTodayHours,
        currentDay: weekdayPart,
      };
    } else if (currentTimeInMinutes < openMinutes) {
      return {
        isOpen: false,
        statusText: 'Closed Now',
        nextStatusMessage: `Opens today at ${format12Hr(todaySchedule.openTime)}`,
        todayHours: formattedTodayHours,
        currentDay: weekdayPart,
      };
    } else {
      // Already closed today, find next day
      const currentDayIdx = dayOrder.indexOf(weekdayPart as any);
      let nextOpening = '';

      for (let i = 1; i <= 7; i++) {
        const nextIdx = (currentDayIdx + i) % 7;
        const nextDayName = dayOrder[nextIdx];
        const nextSched = days.find((d) => d.day.toLowerCase() === nextDayName);
        if (nextSched && nextSched.isOpen) {
          const capDay = nextDayName.charAt(0).toUpperCase() + nextDayName.slice(1);
          nextOpening = i === 1 ? `Opens tomorrow at ${format12Hr(nextSched.openTime)}` : `Opens ${capDay} at ${format12Hr(nextSched.openTime)}`;
          break;
        }
      }

      return {
        isOpen: false,
        statusText: 'Closed Now',
        nextStatusMessage: nextOpening || 'Closed for the day',
        todayHours: formattedTodayHours,
        currentDay: weekdayPart,
      };
    }
  } catch (error) {
    return {
      isOpen: true,
      statusText: 'Open',
      nextStatusMessage: 'Welcome',
      todayHours: 'Open Today',
      currentDay: 'today',
    };
  }
};

const format12Hr = (time24: string): string => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  return `${h}:${m} ${ampm}`;
};
