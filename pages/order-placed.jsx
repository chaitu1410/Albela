import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Link from "next/link";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import orderPlacedStyles from "../styles/pages/OrderPlaced.module.css";

const OrderPlaced = () => {
  const [open, setOpen] = useState(true);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <div className={orderPlacedStyles.container}>
      <Head>
        <title>Albela | Order Placed</title>
      </Head>
      <Snackbar
        open={open}
        autoHideDuration={4444}
        onClose={handleClose}
        className="snackbar"
      >
        <Alert onClose={handleClose} severity="success">
          Order Placed!
        </Alert>
      </Snackbar>
      <div className={orderPlacedStyles.imageDiv}>
        <img src="/assets/order-placed.gif" alt="OrderPlaced" />
      </div>
      <Link href="/">
        <a>
          <button className={orderPlacedStyles.button}>
            Go to Shop more &gt;&gt;
          </button>
        </a>
      </Link>
    </div>
  );
};

export default OrderPlaced;
