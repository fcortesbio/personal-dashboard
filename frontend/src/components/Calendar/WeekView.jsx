import React from 'react';
import { useCalendar } from '../../hooks/useCalendar';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeekView() {
  const { events, currentWeek, isLoading, error, nextWeek, prevWeek, today } = useCalendar();

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const isCurrentWeek = isToday(new Date(), currentWeek);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
        <div className="flex gap-2">
          <button
            onClick={prevWeek}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            ← Previous
          </button>
          <button
            onClick={today}
            className={`px-3 py-1 rounded transition ${
              isCurrentWeek
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Next →
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {isLoading && <div className="text-gray-600">Loading events...</div>}

      {!isLoading && (
        <div className="flex-1 bg-white rounded-lg shadow overflow-auto">
          <div className="min-w-max h-full">
            {/* Day headers */}
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="w-20 flex-shrink-0 border-r border-gray-200" />
              {weekDates.map((date, idx) => {
                const isToday_ = isToday(date, new Date());
                return (
                  <div
                    key={idx}
                    className={`flex-1 p-3 text-center border-r border-gray-200 ${
                      isToday_ ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-700">{DAYS[idx]}</div>
                    <div className={`text-lg font-bold ${
                      isToday_ ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div className="flex">
              {/* Time labels */}
              <div className="w-20 flex-shrink-0 border-r border-gray-200">
                {HOURS.map(hour => (
                  <div key={hour} className="h-24 border-b border-gray-200 text-xs text-gray-500 p-1">
                    {`${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'P' : 'A'}`}
                  </div>
                ))}
              </div>

              {/* Events grid */}
              {weekDates.map((date, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`flex-1 border-r border-gray-200 ${
                    isToday(date, new Date()) ? 'bg-blue-50' : ''
                  }`}
                >
                  {HOURS.map(hour => (
                    <div key={hour} className="h-24 border-b border-gray-200 relative" />
                  ))}

                  {/* Render events for this day */}
                  {events
                    .filter(event => isSameDay(new Date(event.start), date))
                    .map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event }) {
  const startDate = new Date(event.start);
  const hour = startDate.getHours();
  const minute = startDate.getMinutes();
  const topPercent = ((hour - 6) * 60 + minute) / (17 * 60) * 100;

  return (
    <div
      className="absolute left-1 right-1 bg-blue-500 text-white text-xs p-1 rounded"
      style={{
        top: `${topPercent}%`,
        zIndex: 5,
      }}
      title={event.summary}
    >
      <div className="font-semibold truncate">{event.summary}</div>
      {event.location && <div className="text-xs truncate">{event.location}</div>}
    </div>
  );
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isToday(date, today) {
  return isSameDay(date, today);
}
