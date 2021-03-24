import React from "react";
import { Table } from "antd";
import _ from "lodash";

export const EventsTable = ({ events, selectedEventIds, setSelectedEventIds }) => {
  const columns = [
    {},
    ...Object.keys(_.omit(events[0], "id")).map((key) => ({
      title: key,
      dataIndex: key,
      sorter: (a, b) => a[key] < b[key],
    })),
  ];

  let data = events.map((e) => ({ key: e.id, ..._.omit(e, "id") }));

  return (
    <Table
      rowSelection={{
        selectedRowKeys: selectedEventIds,
        onChange: (selectedRowKeys) => {
          setSelectedEventIds(selectedRowKeys);
        },
      }}
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 1000 }}
    />
  );
};
