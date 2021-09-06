import React, { useEffect } from "react";
import Link from "next/link";
import CurrencyFormat from "react-currency-format";
import { useStateValue } from "../context/StateProvider.js";
import { getBasketTotal } from "../context/reducer.js";
import subtotal from "../styles/components/Subtotal.module.css";
import router from "next/router";
import { db } from "../services/firebase.js";

const Subtotal = () => {
  const [{ basket, price, user }, dispatch] = useStateValue();

  const emptyBasket = () => {
    dispatch({
      type: "EMPTY_BASKET",
    });
    dispatch({
      type: "RESET_PRICE",
    });
  };

  useEffect(() => {
    dispatch({
      type: "RESET_PRICE",
    });
  }, []);

  return (
    <div className={subtotal.subtotal}>
      <CurrencyFormat
        renderText={(value) => (
          <>
            <p>
              Subtotal ({basket.length} items): <strong>{value}</strong>
            </p>
          </>
        )}
        // decimalScale={2}
        value={price}
        displayType={"text"}
        thousandSeparator={true}
        prefix={"₹"}
      />

      {price ? (
        <Link href="/payment">
          <a>
            <button className={subtotal.checkout__button}>
              Proceed to Payment
            </button>
          </a>
        </Link>
      ) : (
        <></>
      )}
      {/* {basket.length !== 0 ? (
        <button
          style={{ background: "lightgray" }}
          className={subtotal.checkout__button}
          onClick={emptyBasket}
        >
          Empty basket
        </button>
      ) : (
        <></>
      )} */}
      <Link href="/">
        <a
          style={{
            // textAlign: "center",
            textDecoration: "none",
            marginTop: 7,
            color: "blue",
          }}
        >
          &lt; Go back
        </a>
      </Link>
    </div>
  );
};

export default Subtotal;
