import "./App.css";
import "antd/dist/antd.css";
import GoogleLogin from "react-google-login";
import { DateTime, Interval } from "luxon";
import React, { useEffect, useState } from "react";
import { Button, Layout, message, DatePicker } from "antd";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import { Content } from "antd/lib/layout/layout";
import moment from "moment";
import { ConfigProvider } from "antd";
import plPL from "antd/lib/locale/pl_PL";

import { EventsTable } from "./EventsTable";
import { EventsChart } from "./EventsChart";
import { getEvents } from "./Calendar";
import Title from "antd/lib/typography/Title";

const CLIENT_ID =
  "510023038871-6dmmdbi7noppaneij163tfanh3odkoec.apps.googleusercontent.com";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [events, setEvents] = useState(null);
  const [dateStart, setDateStart] = useState(
    DateTime.now().startOf("week").toISO()
  );
  const [dateEnd, setDateEnd] = useState(DateTime.now().endOf("week").toISO());

  useEffect(() => {
    const at = localStorage.getItem("accessToken");
    if (at && at !== accessToken) {
      console.log(`Access token from LocalStorage: ${at}`);
      setAccessToken(at);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const email = localStorage.getItem("email");
    getEvents(accessToken, dateStart, dateEnd, email).then(setEvents, (err) => {
      console.log(err);
      message.error("Error loading events");
    });
  }, [accessToken, dateStart, dateEnd]);

  const onSuccess = (data) => {
    localStorage.setItem("email", data.profileObj.email);
    const at = data.accessToken;
    localStorage.setItem("accessToken", at);
    setAccessToken(at);
  };
  const onFailure = (data) => {
    console.log(`Failure: ${JSON.stringify(data)}`);
    message.error(`Failed logging into Google Calendar`);
  };

  const onDateRangeChange = (dates) => {
    if (!dates) {
      return;
    }
    const dateStrings = [dates[0].toISOString(), dates[1].toISOString()];
    console.log(dateStrings);
    setDateStart(dateStrings[0]);
    setDateEnd(dateStrings[1]);
  };

  const onDateLeft = () => {
    const ds = DateTime.fromISO(dateStart);
    const de = DateTime.fromISO(dateEnd);
    const duration = Interval.fromDateTimes(ds, de).toDuration("day");
    setDateStart(ds.minus(duration).toISO());
    setDateEnd(de.minus(duration).toISO());
  };

  const onDateRight = () => {
    const ds = DateTime.fromISO(dateStart);
    const de = DateTime.fromISO(dateEnd);
    const duration = Interval.fromDateTimes(ds, de).toDuration("day");
    setDateStart(DateTime.fromISO(dateStart).plus(duration).toISO());
    setDateEnd(DateTime.fromISO(dateEnd).plus(duration).toISO());
  };

  const total = events
    ? events
        .map((event) => event.duration)
        .reduce((acc, val) => acc + val)
        .toFixed(2)
    : 0;

  return (
    <ConfigProvider locale={plPL}>
      <Layout>
        <Content style={{ padding: "50px" }}>
          {!accessToken && (
            <GoogleLogin
              clientId={CLIENT_ID}
              buttonText="Login"
              onSuccess={onSuccess}
              onFailure={onFailure}
              cookiePolicy={"single_host_origin"}
              scope={"https://www.googleapis.com/auth/calendar.readonly"}
            />
          )}

          {accessToken && (
            <>
              <Button icon={<DoubleLeftOutlined />} onClick={onDateLeft} />
              <DatePicker.RangePicker
                onChange={onDateRangeChange}
                defaultValue={[moment(dateStart), moment(dateEnd)]}
                value={[moment(dateStart), moment(dateEnd)]}
              />
              <Button icon={<DoubleRightOutlined />} onClick={onDateRight} />
              <Button
                type="danger"
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  setAccessToken(null);
                }}
              >
                Logout
              </Button>
            </>
          )}

          {events && (
            <>
              <Title>Total: {total}h</Title>
              <EventsChart events={events} />
              <EventsTable events={events} />
              <pre>
                {events
                  .map((event) => Object.values(event).join(";"))
                  .join("\n")}
              </pre>
            </>
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
