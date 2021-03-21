import React from "react";
import ApexChart from "react-apexcharts";
import { DateTime } from "luxon";

const getMeetingsPerDay = (events) => {
  const meetingPerDay = {};
  events.forEach((event) => {
    const date = DateTime.fromISO(event.start).toFormat("yyyy-LL-dd");
    if (!(date in meetingPerDay)) {
      meetingPerDay[date] = +event.duration;
    } else {
      meetingPerDay[date] = +event.duration + meetingPerDay[date];
    }
  });

  const ordered = Object.keys(meetingPerDay)
    .sort()
    .reduce((obj, key) => {
      obj[key] = meetingPerDay[key].toFixed(2);
      return obj;
    }, {});

  return ordered;
};

export const EventsChart = ({ events }) => {
  const meetingPerDay = getMeetingsPerDay(events);

  const series = [
    {
      name: "Meetings",
      data: Object.values(meetingPerDay),
    },
  ];
  const options = {
    chart: {
      height: 350,
      type: "bar",
    },
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top", // top, center, bottom
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },

    xaxis: {
      categories: Object.keys(meetingPerDay),
      position: "bottom",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        fill: {
          type: "gradient",
          gradient: {
            colorFrom: "#D8E3F0",
            colorTo: "#BED1E6",
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
      },
    },
    title: {
      text: "Meetings total time by day",
      floating: true,
      align: "center",
      style: {
        color: "#444",
      },
    },
  };

  return (
    <ApexChart options={options} series={series} type="bar" height={350} />
  );
};
