import { CircularProgress, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DirectBuyProduct from "../components/DirectBuyProduct";
import Header from "../components/Header";
import { useStateValue } from "../context/StateProvider";
import { db, firebase } from "../services/firebase";
import paymentStyles from "../styles/pages/Payment.module.css";

const Payment = () => {
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);
  const [{ user, basket, price, directBuyProduct }, dispatch] = useStateValue();
  const [newBasket, setNewBasket] = useState(basket);
  const [ordering, setOrdering] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAdded, setOpenAdded] = useState(false);
  const [openRemoved, setOpenRemoved] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
    router.replace("/orders");
  };
  const handleCloseRemoved = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenRemoved(false);
  };

  const handleCloseAdded = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenAdded(false);
  };

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
    return fetch("/api/payment", {
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

  const placeOrder = async (e) => {
    const proceed = async () => {
      if (paymentMethod === "cod") {
        if (directBuyProduct) {
          const doc = await db
            .collection("Products")
            .doc(directBuyProduct.product)
            .get();
          await db.collection("Orders").add({
            product: directBuyProduct.product,
            quantity: directBuyProduct.quantity,
            customer: user?.id,
            seller: doc.data().by,
            address: address,
            name: user?.name,
            phno: user?.phno,
            price: price,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            paymentMethod: "COD (Cash on Delivery)",
            status: "Order Placed",
          });
        } else {
          for (const id of newBasket) {
            const doc = await db.collection("Products").doc(id).get();
            const snapshot = await db
              .collection("Sellers")
              .doc(doc.data().by)
              .get();
            if (
              snapshot.data().isVIP ||
              snapshot.data().rechargeValidity >= new Date().getTime()
            ) {
              await db.collection("Orders").add({
                product: id,
                quantity: basket.filter((itemID) => itemID === id).length,
                customer: user?.id,
                seller: doc.data().by,
                address: address,
                name: user?.name,
                phno: user?.phno,
                price: `${
                  doc.data().discount && doc.data().discount !== "0"
                    ? basket.filter((itemID) => itemID === id).length *
                      (
                        Number(doc.data().price) -
                        (Number(doc.data().price) *
                          Number(doc.data().discount)) /
                          100
                      ).toFixed(0)
                    : basket.filter((itemID) => itemID === id).length *
                      Number(doc.data().price)
                }`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                paymentMethod: "COD (Cash on Delivery)",
                status: "Order Placed",
              });
            }
          }
        }
      } else {
        if (directBuyProduct) {
          const getBasketArray = () => {
            const array = [];
            for (let index = 0; index < directBuyProduct.quantity; index++) {
              array.push(directBuyProduct.product);
            }
            return array;
          };
          const response = await getData({
            price: price.toString(),
            phno: user.phno.toString(),
            newBasket: [directBuyProduct.product],
            basket: getBasketArray(),
            customer: user.id.toString(),
            name: user.name.toString(),
            address: address.toString(),
          });
          const information = {
            action: "https://securegw-stage.paytm.in/order/process",
            params: response,
          };
          post(information);
        } else {
          const response = await getData({
            price: price.toString(),
            phno: user.phno.toString(),
            newBasket: newBasket,
            basket: basket,
            customer: user.id.toString(),
            name: user.name.toString(),
            address: address.toString(),
          });
          const information = {
            action: "https://securegw-stage.paytm.in/order/process",
            params: response,
          };
          post(information);
        }
      }
      if (directBuyProduct) {
        dispatch({
          type: "SET_DIRECT_BUY_PRODUCT",
          directBuyProduct: null,
        });
        setOpen(true);
        dispatch({
          type: "RESET_PRICE",
        });
        setOrdering(false);
      } else {
        dispatch({
          type: "EMPTY_BASKET",
        });
        db.collection("Users")
          .doc(user?.id)
          .update({ basket: [] })
          .then(() => {
            setOpen(true);
            dispatch({
              type: "RESET_PRICE",
            });
            setOrdering(false);
          });
      }
    };

    e.preventDefault();
    if (address.length < 10) {
      alert("Please enter a valid address");
    } else {
      setOrdering(true);
      if (user?.address !== address) {
        db.collection("Users")
          .doc(user?.id)
          .update({
            address,
          })
          .then(() => {
            proceed();
          });
      } else {
        proceed();
      }
    }
  };

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
              setAddress(data.data().address);
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
      setAddress(user?.address);
      setShowLoading(false);
    }

    return () => {
      if (directBuyProduct) {
        dispatch({
          type: "SET_DIRECT_BUY_PRODUCT",
          directBuyProduct: null,
        });
      }
    };
  }, []);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <>
      <Head>
        <title>Albela | Payment</title>
      </Head>
      <Header forPayments />
      <Snackbar
        open={open}
        autoHideDuration={1111}
        onClose={handleClose}
        className="snackbar"
      >
        <Alert onClose={handleClose} severity="success">
          Order Placed!
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
      <div className={paymentStyles.payment}>
        {directBuyProduct && (
          <div
            style={{
              paddingLeft: 7,
              paddingRight: 7,
              background: "white",
              width: "98%",
              marginBottom: 4,
              borderRadius: 4,
              margin: "auto",
              maxWidth: 800,
            }}
          >
            <DirectBuyProduct
              id={directBuyProduct.product}
              setOpen={setOpen}
              setOpenAdded={setOpenAdded}
              setOpenRemoved={setOpenRemoved}
            />
          </div>
        )}
        <div className={paymentStyles.form}>
          <h3 style={{ textAlign: "center" }}>Place Order</h3>
          <textarea
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ marginTop: "2px" }}
            className={paymentStyles.inputs}
            name="address"
            id="address"
            cols="30"
            rows="10"
          ></textarea>
          <h5 style={{ marginTop: 7 }}>Select payment method</h5>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              id="op"
              value="op"
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label className="form-check-label" htmlFor="op">
              Online Payment
            </label>
          </div>
          <div className="form-check">
            <input
              checked={paymentMethod === "cod"}
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              id="cod"
              value="cod"
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label className="form-check-label" htmlFor="cod">
              COD(Cash on Delivery)
            </label>
          </div>
          {price ? (
            ordering ? (
              <div
                style={{ display: "grid", placeItems: "center", marginTop: 21 }}
              >
                <CircularProgress size={24} />
              </div>
            ) : (
              <button
                onClick={placeOrder}
                className={paymentStyles.orderButton}
              >
                Place Order
              </button>
            )
          ) : (
            <button
              onClick={() => router.replace("/checkout")}
              className={paymentStyles.orderButton}
            >
              Go to Basket
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Payment;
