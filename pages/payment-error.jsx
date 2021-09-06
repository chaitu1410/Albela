import Link from "next/link";
import Head from "next/head";
import React from "react";
import orderPlacedStyles from "../styles/pages/OrderPlaced.module.css";

const OrderPlaced = () => {
  return (
    <div className={orderPlacedStyles.container}>
      <Head>
        <title>Albela | Payment Error</title>
      </Head>
      <div className={orderPlacedStyles.imageDiv}>
        <img src="/assets/error.gif" alt="PaymentError" />
      </div>
      <p style={{ textAlign: "center", color: "tomato" }}>
        Payment Error occurred!
      </p>
      <Link href="/">
        <a>
          <button className={orderPlacedStyles.button}>Back to Home</button>
        </a>
      </Link>
    </div>
  );
};

export default OrderPlaced;
