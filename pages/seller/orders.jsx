import { CircularProgress } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import OrderProduct from "../../components/OrderProduct";
import DashboardHeader from "../../components/seller/DashboardHeader";
import { useStateValue } from "../../context/StateProvider";
import { db } from "../../services/firebase";
import orderStyles from "../../styles/pages/Order.module.css";
import Head from "next/head";

const Orders = () => {
  const [{ user }, dispatch] = useStateValue();
  const [orders, setOrders] = useState();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      const userID = localStorage.getItem("albelaUserID");

      if (userID) {
        db.collection("Users")
          .doc(userID)
          .get()
          .then((data) => {
            if (data.exists) {
              dispatch({
                type: "SET_USER",
                user: {
                  id: data.id,
                  name: data.data().name,
                  phno: data.data().phno,
                  password: data.data().password,
                  isSeller: data.data().isSeller,
                  address: data.data().address,
                  sellerID: data.data().sellerID,
                },
              });
              dispatch({
                type: "SET_BASKET",
                basket: data.data().basket,
              });
              if (!data.data().isSeller) {
                router.replace("/seller/register");
              }
            } else {
              router.replace("/auth/login");
            }
          });
      } else {
        router.replace("/auth/login");
      }
    } else {
      if (!user.isSeller) {
        router.replace("/seller/register");
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      db.collection("Orders")
        .where("seller", "==", user?.sellerID)
        .onSnapshot((snapshot) => {
          setOrders(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              product: doc.data().product,
              paymentMethod: doc.data().paymentMethod,
              quantity: doc.data().quantity,
              price: doc.data().price,
              address: doc.data().address,
              status: doc.data()?.status,
              timestamp: doc.data().timestamp,
              name: doc.data().name,
              phno: doc.data().phno,
            }))
          );
          setShowLoading(false);
        });
    }
  }, [user]);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div className={orderStyles.order}>
      <Head>
        <title>Albela (Seller) | Orders & Tracking</title>
      </Head>
      <DashboardHeader />
      <div className={orderStyles.product__row}>
        {orders
          ?.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())
          .map((order) => (
            <OrderProduct
              id={order.id}
              productID={order.product}
              paymentMethod={order.paymentMethod}
              quantity={order.quantity}
              price={order.price}
              address={order.address}
              status={order.status}
              timestamp={order.timestamp}
              usingFor="seller"
              name={order.name}
              phno={order.phno}
            />
          ))}
      </div>
    </div>
  );
};

export default Orders;
