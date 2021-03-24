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
    const at = sessionStorage.getItem("accessToken");
    if (at && at !== accessToken) {
      console.log(`Access token from LocalStorage: ${at}`);
      setAccessToken(at);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const email = sessionStorage.getItem("email");
    getEvents(accessToken, dateStart, dateEnd, email).then(setEvents, (err) => {
      console.log(err);
      message.error("Error loading events");
      setAccessToken(null);
      sessionStorage.removeItem("accessToken");
    });
  }, [accessToken, dateStart, dateEnd]);

  const onSuccess = (data) => {
    sessionStorage.setItem("email", data.profileObj.email);
    const at = data.accessToken;
    sessionStorage.setItem("accessToken", at);
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
          <div>
            <Title>Google Calendar meetings stats</Title>
            <p>
              This web app lets you see some stats for the amount of time you
              spend on meetings daily and weekly
            </p>
            <p>
              The data is fetched from Google Calendar API, to access it please
              click the Login button and sign into your Google account.
            </p>
          </div>
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
                  sessionStorage.removeItem("accessToken");
                  setAccessToken(null);
                }}
              >
                Logout
              </Button>
            </>
          )}

          {accessToken && events && (
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

          <div>
            <Title>Privacy Policy</Title>
            <p>
              This app uses Google Calendar API to fetch the events data from
              your primary Google calendar. This happens directly in your
              browser, there are no external services or backend servers
              involved.
            </p>
            <p>
              The data fetched from Google Calendar API is only used in this
              browser tab and is not saved anywhere outside of it, not send to
              any third-party services. After you close this tab, the data
              cached by this page is deleted from your computer.
            </p>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
