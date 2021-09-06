import { CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import OrderProduct from "../../components/OrderProduct";
import { useStateValue } from "../../context/StateProvider";
import { db } from "../../services/firebase";
import orderStyles from "../../styles/pages/Order.module.css";
import Head from "next/head";

const Orders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState();
  const [showLoading, setShowLoading] = useState(true);
  const [{ isAdminValidated }, dispatch] = useStateValue();

  useEffect(() => {
    if (isAdminValidated) {
      db.collection("Orders")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setOrders(
            snapshot.docs.map((doc) => ({
              product: doc.data().product,
              paymentMethod: doc.data().paymentMethod,
              quantity: doc.data().quantity,
              price: doc.data().price,
              address: doc.data().address,
              status: doc.data().status,
              timestamp: doc.data().timestamp,
              name: doc.data().name,
              phno: doc.data().phno,
            }))
          );
          setShowLoading(false);
        });
    } else {
      router.replace("/albela-admin");
    }
  }, [isAdminValidated]);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div className={orderStyles.order}>
      <Head>
        <title>Albela (Admin) | Orders & Tracking</title>
      </Head>
      <AdminHeader />
      <div className={orderStyles.product__row}>
        {orders?.map((order) => (
          <OrderProduct
            productID={order.product}
            paymentMethod={order.paymentMethod}
            quantity={order.quantity}
            price={order.price}
            address={order.address}
            status={order.status}
            timestamp={order.timestamp}
            usingFor="admin"
            name={order.name}
            phno={order.phno}
          />
        ))}
      </div>
    </div>
  );
};

export default Orders;
