import React from "react";
import { Table } from "antd";

export const EventsTable = ({ events }) => {
  const columns = Object.keys(events[0]).map((key) => ({
    title: key,
    dataIndex: key,
    sorter: (a, b) => a[key] < b[key],
  }));

  let data = events;
  
  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 1000 }}
    />
  );
};
