import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import loginStyles from "../../styles/pages/Login.module.css";
import Router from "next/router";
import { useStateValue } from "../../context/StateProvider";
import Header from "../../components/Header";
import { CircularProgress } from "@material-ui/core";
import Link from "next/link";
import Head from "next/head";

const Login = () => {
  const [phno, setPhno] = useState("");
  const [password, setPassword] = useState("");
  const [showLoading, setShowLoading] = useState(true);
  const [{ user }, dispatch] = useStateValue();
  const [loggingIn, setLoggingIn] = useState(false);

  const login = (e) => {
    e.preventDefault();
    setLoggingIn(true);

    db.collection("Users")
      .where("phno", "==", phno)
      .get()
      .then((data) => {
        if (!data.empty) {
          if (data.docs[0].data().password === password) {
            dispatch({
              type: "SET_USER",
              user: {
                id: data.docs[0].id,
                name: data.docs[0].data().name,
                phno: data.docs[0].data().phno,
                password,
                isSeller: data.docs[0].data().isSeller,
                address: data.docs[0].data().address,
                sellerID: data.docs[0].data().sellerID,
              },
            });
            dispatch({
              type: "SET_BASKET",
              basket: data.docs[0].data().basket,
            });
            localStorage.setItem("albelaUserID", data.docs[0].id);
            Router.replace("/");
          } else {
            setLoggingIn(false);
            alert("Password incorrect!");
          }
        } else {
          alert("You do not have an account!");
          setLoggingIn(false);
        }
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
              Router.replace("/");
            } else {
              setShowLoading(false);
            }
          });
      } else {
        setShowLoading(false);
      }
    } else {
      Router.replace("/");
    }
  }, []);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <>
      <Head>
        <title>Albela | Log In</title>
      </Head>
      <Header forAuth forPayments />
      <div className={loginStyles.login}>
        <form className={loginStyles.form}>
          <h3 style={{ textAlign: "center" }}>Login</h3>
          <input
            value={phno}
            onChange={(e) => setPhno(e.target.value)}
            className={loginStyles.inputs}
            type="number"
            name="phno"
            id="phno"
            placeholder="Mobile number"
            minLength={10}
            maxLength={10}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={loginStyles.inputs}
            type="password"
            name="password"
            id="password"
            placeholder="Password"
          />
          {loggingIn ? (
            <div style={{ display: "grid", placeItems: "center" }}>
              <CircularProgress size={24} />
            </div>
          ) : (
            <button onClick={login} className={loginStyles.loginButton}>
              Login
            </button>
          )}
          <Link href="/auth/signup">
            <a style={{ textDecoration: "none" }}>
              <button className={loginStyles.loginButton}>
                Don't have an account? Sign Up here
              </button>
            </a>
          </Link>
          <Link href="/auth/forgot-password">
            <a style={{ textDecoration: "none" }}>
              <button className={loginStyles.loginButton}>
                Forgot Password
              </button>
            </a>
          </Link>
        </form>
      </div>
    </>
  );
};

export default Login;
