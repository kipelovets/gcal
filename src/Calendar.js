import axios from "axios";
import { DateTime, Interval } from "luxon";

const get = (url, accessToken) =>
  axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

const getEventsApi = (accessToken, from, to) =>
  get(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      from
    )}&timeMax=${encodeURIComponent(to)}&singleEvents=true`,
    accessToken
  );

export const getEvents = (accessToken, from, to, email) => {
  return new Promise((resolve, reject) => {
    getEventsApi(accessToken, from, to)
      .then((resp) => {
        let events = [];

        resp.data.items.forEach((item) => {
          let status = item.status;

          if ("attendees" in item) {
            const myRecord = item.attendees.filter((a) => a.email === email)[0];
            if (myRecord) {
              status = myRecord.responseStatus;
            }
          }

          const duration =
            item.start && item.end
              ? Interval.fromDateTimes(
                  DateTime.fromISO(item.start.dateTime),
                  DateTime.fromISO(item.end.dateTime)
                )
                  .toDuration()
                  .as("hour")
              : "";

          events.push({
            id: item.id,
            summary: item.summary,
            start: item.start ? item.start.dateTime : "",
            end: item.end ? item.end.dateTime : "",
            duration,
            status,
          });
        });

        events = events.filter(
          (item) => ["confirmed", "accepted"].indexOf(item.status) !== -1
        );

        resolve(events);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};
