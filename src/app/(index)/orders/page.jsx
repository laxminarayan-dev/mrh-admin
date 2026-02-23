"use client";
import OrderHeader from "@/components/Orders/OrderHeader";
import OrderTable from "@/components/Orders/OrderTable";
import { fetchAllOrder } from "@/store/orderAPI";
import { Fragment, useEffect, useState } from "react";
import Socket from "@/components/Socket/socket";
import { getRiders } from "@/store/employeeAPI";

const OrdersHistory = () => {
  const [data, setData] = useState([]);
  const [riders, setRiders] = useState([]);

  const loadData = async () => {
    const orders = await fetchAllOrder();
    const riders = await getRiders();
    setRiders(riders);
    setData(orders);
  };

  useEffect(() => {
    loadData();
  }, []);

  // socket connection status logging
  useEffect(() => {
    if (!Socket.connected) {
      Socket.connect();
    }
    Socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    Socket.on("admin-order-updated", (updatedOrder) => {
      setData((prevData) =>
        prevData.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        ),
      );
    });

    Socket.on("admin-empupdate", (data) => {
      getRiders()
        .then((riders) => {
          setRiders(riders);
        })
        .catch((error) => {
          console.error("Error fetching riders:", error);
        });
    });

    Socket.on("new-order", (order) => {
      setData((prevData) => [order, ...prevData]);
    });

    Socket.on("admin-order-cancelled", (cancelledOrder) => {
      setData((prevData) =>
        prevData.filter((order) => order._id !== cancelledOrder._id),
      );
    });

    Socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => {
      Socket.off("admin-order-updated");
      Socket.off("new-order");
      Socket.off("admin-order-cancelled");
      Socket.off("admin-empupdate");
    };
  }, []);

  return (
    <Fragment>
      <OrderHeader onAddData={loadData} />
      {data.length <= 0 ? (
        <div className="w-full bg-white shadow h-[calc(100vh-20rem)] flex justify-center items-center rounded-md">
          <h1 className="text-lg text-gray-700">No data to display.</h1>
        </div>
      ) : (
        <OrderTable orders={data} riders={riders} />
      )}
    </Fragment>
  );
};
export default OrdersHistory;
