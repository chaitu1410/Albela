import React, { useEffect, useState } from "react";
import utilities from "../../services/utilities.json";
import DashboardHeader from "../../components/seller/DashboardHeader";
import rechargeStyles from "../../styles/pages/seller/Recharge.module.css";
import { useStateValue } from "../../context/StateProvider";
import { CircularProgress } from "@material-ui/core";
import { db } from "../../services/firebase";
import router from "next/router";
import Head from "next/head";

const Recharge = () => {
  const [paymentPlan, setPaymentPlan] = useState("500");
  const [{ user }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);
  const [phno, setPhno] = useState("");
  const [email, setEmail] = useState("");
  const [validity, setValidity] = useState("");
  const [sellerID, setSellerID] = useState("");

  const isDate = (val) => {
    // Cross realm comptatible
    return Object.prototype.toString.call(val) === "[object Date]";
  };

  const isObj = (val) => {
    return typeof val === "object";
  };

  const stringifyValue = (val) => {
    if (isObj(val) && !isDate(val)) {
      return JSON.stringify(val);
    } else {
      return val;
    }
  };

  const buildForm = ({ action, params }) => {
    const form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", action);

    Object.keys(params).forEach((key) => {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", key);
      input.setAttribute("value", stringifyValue(params[key]));
      form.appendChild(input);
    });

    return form;
  };

  const post = (details) => {
    const form = buildForm(details);
    document.body.appendChild(form);
    form.submit();
    form.remove();
  };

  const getData = (data) => {
    return fetch("/api/recharge", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .catch((error) => console.error(error));
  };

  const recharge = (e) => {
    e.preventDefault();
    getData({
      price: paymentPlan.toString(),
      email: email.toString(),
      phno: phno.toString(),
      sellerID: sellerID.toString(),
    }).then((response) => {
      const information = {
        action: "https://securegw-stage.paytm.in/order/process",
        params: response,
      };
      post(information);
    });
  };

  useEffect(() => {
    if (!user) {
      const userID = localStorage.getItem("albelaUserID");

      if (userID) {
        db.collection("Users")
          .doc(userID)
          .get()
          .then((data) => {
            if (data.exists) {
              db.collection("Sellers")
                .doc(data.data().sellerID)
                .get()
                .then((sellerData) => {
                  if (sellerData.data().isVIP) {
                    alert("You are VIP on Albela no need to recharge 😉");
                    router.push("/seller/profile");
                  } else {
                    setSellerID(sellerData.id);
                    setPhno(sellerData.data().phno);
                    setEmail(sellerData.data().email);
                    setValidity(sellerData.data().rechargeValidity);
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
                    } else {
                      setShowLoading(false);
                    }
                  }
                });
            } else {
              setShowLoading(false);
              router.replace("/auth/login");
            }
          });
      } else {
        router.replace("/auth/login");
      }
    } else {
      if (!user.isSeller) {
        router.replace("/seller/register");
      } else {
        db.collection("Sellers")
          .doc(user?.sellerID)
          .get()
          .then((sellerData) => {
            if (sellerData.data().isVIP) {
              alert("You are VIP on Albela no need to recharge 😉");
              router.push("/seller/profile");
            } else {
              setSellerID(sellerData.id);
              setPhno(sellerData.data().phno);
              setEmail(sellerData.data().email);
              setValidity(sellerData.data().rechargeValidity);

              setShowLoading(false);
            }
          });
      }
    }
  }, []);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div className={rechargeStyles.recharge}>
      <Head>
        <title>Albela (Seller) | Recharge</title>
      </Head>
      <DashboardHeader />
      <div className={rechargeStyles.body}>
        <form className={rechargeStyles.recharge_plan_cards}>
          <p
            className={rechargeStyles.note}
            style={{ color: validity < new Date().getTime() && "tomato" }}
          >
            {validity < new Date().getTime()
              ? "You do not have an active seller subscription"
              : `Your subscription is valid till: ${new Date(
                  validity
                ).toLocaleString()}`}
          </p>
          <div className={rechargeStyles.recharge_card}>
            <input
              className="form-check-input"
              type="radio"
              name="paymentPlan"
              id="14"
              value="14"
              onChange={(e) => setPaymentPlan(e.target.value)}
            />
            <label
              className={`form-check-label ${rechargeStyles.card_label}`}
              htmlFor="14"
            >
              <p className={rechargeStyles.product__price}>
                <small>₹</small>
                <strong>14</strong>
              </p>
              <p className={rechargeStyles.validity}>1 Week Subscription</p>
            </label>
          </div>
          <div className={rechargeStyles.recharge_card}>
            <input
              className="form-check-input"
              type="radio"
              name="paymentPlan"
              id="56"
              value="56"
              onChange={(e) => setPaymentPlan(e.target.value)}
            />
            <label
              className={`form-check-label ${rechargeStyles.card_label}`}
              htmlFor="56"
            >
              <p className={rechargeStyles.product__price}>
                <small>₹</small>
                <strong>56</strong>
              </p>
              <p className={rechargeStyles.validity}>
                1 Month (28 days) Subscription
              </p>
            </label>
          </div>
          <div className={rechargeStyles.recharge_card}>
            <input
              className="form-check-input"
              type="radio"
              name="paymentPlan"
              id="168"
              value="168"
              onChange={(e) => setPaymentPlan(e.target.value)}
            />
            <label
              className={`form-check-label ${rechargeStyles.card_label}`}
              htmlFor="168"
            >
              <p className={rechargeStyles.product__price}>
                <small>₹</small>
                <strong>168</strong>
              </p>
              <p className={rechargeStyles.validity}>
                3 Months (84 days) Subscription
              </p>
            </label>
          </div>
          <div className={rechargeStyles.recharge_card}>
            <input
              className="form-check-input"
              type="radio"
              name="paymentPlan"
              id="275"
              value="275"
              onChange={(e) => setPaymentPlan(e.target.value)}
            />
            <label
              className={`form-check-label ${rechargeStyles.card_label}`}
              htmlFor="275"
            >
              <p className={rechargeStyles.product__price}>
                <small>₹</small>
                <strong>275</strong>
              </p>
              <p className={rechargeStyles.validity}>
                6 months (168 days) Subscription
              </p>
            </label>
          </div>
          <div className={rechargeStyles.recharge_card}>
            <input
              checked={paymentPlan === "500"}
              className="form-check-input"
              type="radio"
              name="paymentPlan"
              id="500"
              value="500"
              onChange={(e) => setPaymentPlan(e.target.value)}
            />
            <label
              className={`form-check-label ${rechargeStyles.card_label}`}
              htmlFor="500"
            >
              <p className={rechargeStyles.product__price}>
                <small>₹</small>
                <strong>500</strong>
              </p>
              <p className={rechargeStyles.validity}>
                1 Year (336 days) Subscription
              </p>
            </label>
          </div>
          <button onClick={recharge} className={rechargeStyles.rechargeButton}>
            Recharge
          </button>
        </form>
      </div>
    </div>
  );
};

export default Recharge;
