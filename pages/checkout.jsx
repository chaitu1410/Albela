import React, { useEffect, useState } from "react";
import Subtotal from "../components/Subtotal";
import { useStateValue } from "../context/StateProvider";
import CheckoutProduct from "../components/CheckoutProduct";
import checkoutStyles from "../styles/pages/Checkout.module.css";
import Router from "next/router";
import Head from "next/head";
import { db } from "../services/firebase";
import router from "next/router";
import { CircularProgress, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

const Checkout = () => {
  const [{ basket, user }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);
  const [newBasket, setNewBasket] = useState(basket);
  const [open, setOpen] = useState(false);
  const [openAdded, setOpenAdded] = useState(false);
  const [openRemoved, setOpenRemoved] = useState(false);

  const handleCloseAdded = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenAdded(false);
  };
  const handleCloseRemoved = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenRemoved(false);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    if (user && user?.basket?.length === 0) {
      Router.push("/");
    }
  }, [user]);

  useEffect(() => {
    let newArray = [];
    let uniqueObject = {};
    let objID;

    for (let i in basket) {
      objID = basket[i];
      uniqueObject[objID] = basket[i];
    }

    for (let i in uniqueObject) {
      newArray.push(uniqueObject[i]);
    }

    setNewBasket(newArray);
  }, [basket]);

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
              setShowLoading(false);
            } else {
              setShowLoading(false);
              router.replace("/auth/login");
            }
          });
      } else {
        router.replace("/auth/login");
      }
    } else {
      setShowLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      db.collection("Users").doc(user?.id).update({
        basket: basket,
      });
    }
  }, [basket]);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div className={checkoutStyles.checkout}>
      <Head>
        <title>Albela | Checkout</title>
      </Head>
      <Snackbar
        open={open}
        autoHideDuration={1111}
        onClose={handleClose}
        className="snackbar"
      >
        <Alert onClose={handleClose} severity="info">
          This product is unavailable!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openAdded}
        autoHideDuration={2121}
        onClose={handleCloseAdded}
      >
        <Alert onClose={handleCloseAdded} severity="success">
          Product added!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openRemoved}
        autoHideDuration={2121}
        onClose={handleCloseRemoved}
      >
        <Alert onClose={handleCloseRemoved} severity="warning">
          Product removed!
        </Alert>
      </Snackbar>
      <div className={checkoutStyles.checkout__left}>
        {/* <img
          src="https://images-na.ssl-images-amazon.com/images/G/02/UK_CCMP/TM/OCC_Amazon1._CB423492668_.jpg"
          alt=""
          className={checkoutStyles.checkout__ad}
        /> */}
        <div className={checkoutStyles.container}>
          <h3 className={checkoutStyles.checkout__title}>
            Shopping Basket
            <br />
            <p className={checkoutStyles.itemCountTop}>
              ({basket?.length} items)
            </p>
          </h3>
          {!basket?.length && (
            <h5 style={{ color: "gray" }}>&nbsp;&nbsp;Nothing to show here</h5>
          )}
          {newBasket?.map((id) => (
            <CheckoutProduct
              key={id}
              id={id}
              setOpen={setOpen}
              setOpenAdded={setOpenAdded}
              setOpenRemoved={setOpenRemoved}
            />
          ))}
        </div>
      </div>

      <div className={checkoutStyles.checkout__right}>
        <Subtotal />
      </div>
    </div>
  );
};

export default Checkout;
