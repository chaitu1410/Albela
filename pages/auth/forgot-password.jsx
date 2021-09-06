import React, { useEffect, useState } from "react";
import { useStateValue } from "../../context/StateProvider";
import { auth, db, firebase } from "../../services/firebase";
import signupStyles from "../../styles/pages/Signup.module.css";
import Router from "next/router";
import Header from "../../components/Header";
import { CircularProgress } from "@material-ui/core";
import Link from "next/link";
import Head from "next/head";

const ForgotPassword = () => {
  const [phno, setPhno] = useState("");
  const [otp, setOTP] = useState("");
  const [codeResult, setCodeResult] = useState(null);
  const [{ user }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  const getOTP = async (e) => {
    e.preventDefault();
    setSendingOTP(true);

    db.collection("Users")
      .where("phno", "==", phno)
      .get()
      .then(async (data) => {
        if (data.empty) {
          alert("You don't have an account with this Phone Number!");
        } else {
          if (phno.length === 10) {
            const confirmationResult = await auth.signInWithPhoneNumber(
              `+91${phno}`,
              window.recaptchaVerifier
            );

            window.confirmationResult = confirmationResult;
            setCodeResult(confirmationResult);
          } else {
            alert("Enter a valid Mobile Number");
          }
        }
        setSendingOTP(false);
      })
      .catch((error) => {
        alert(error.message);
        setSendingOTP(false);
      });
  };
  const verifyOTP = (e) => {
    e.preventDefault();
    setVerifyingOTP(true);

    codeResult
      .confirm(otp)
      .then((result) => {
        db.collection("Users")
          .where("phno", "==", phno)
          .get()
          .then((data) => {
            if (!data.empty) {
              dispatch({
                type: "SET_USER",
                user: {
                  id: data.docs[0].id,
                  name: data.docs[0].data().name,
                  phno: data.docs[0].data().phno,
                  password: data.docs[0].data().password,
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
              alert("You do not have an account!");
            }
          });
      })
      .catch((error) => {
        alert(error.message);
        setVerifyingOTP(false);
      });
  };

  useEffect(() => {
    if (!showLoading && phno.length === 10 && !codeResult) {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        "verifier",
        { size: "invisible" }
      );
      recaptchaVerifier
        .render()
        .then((widgetId) => (window.recaptchaWidgetId = widgetId));
    }
  }, [showLoading, phno, codeResult]);

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
        <title>Albela | Forgot Password</title>
      </Head>
      <Header forAuth forPayments />
      <div className={signupStyles.signup}>
        <div className={signupStyles.form}>
          <h3 style={{ textAlign: "center" }}>Forgot Password</h3>
          <div
            className={signupStyles.multiContainer}
            style={{ marginBottom: 4 }}
          >
            <input
              value={phno}
              onChange={(e) => setPhno(e.target.value)}
              className={signupStyles.inputs}
              type="number"
              name="phno"
              id="phno"
              placeholder="Verify your Mobile number"
              maxLength={10}
            />
            {sendingOTP ? (
              <CircularProgress size={24} />
            ) : (
              <button onClick={getOTP}>Get OTP</button>
            )}
          </div>
          {phno.length === 10 && !codeResult && (
            <div
              id="verifier"
              // style={{
              //   marginBottom: "7px",
              //   marginTop: "7px",
              //   maxWidth: "100vw",
              //   overflow: "scroll",
              //   height: 80,
              // }}
            ></div>
          )}
          <div
            className={signupStyles.multiContainer}
            style={{ marginTop: "2px" }}
          >
            <input
              disabled={phno.length === 10 && codeResult ? false : true}
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              className={signupStyles.inputs}
              type="number"
              name="otp"
              id="otp"
              placeholder="Enter OTP"
            />
            {codeResult &&
              (verifyingOTP ? (
                <CircularProgress size={24} />
              ) : (
                <button onClick={verifyOTP}>
                  &nbsp;&nbsp;Verify&nbsp;&nbsp;
                </button>
              ))}
          </div>
          <p style={{ color: "gray", textAlign: "center", fontSize: 11 }}>
            After verification you will be redirected to the Homepage of Albela.
            Head towards Profile section to see your Password
          </p>
          {/* {loggingIn ? (
            <div style={{ display: "grid", placeItems: "center" }}>
              <CircularProgress size={24} />
            </div>
          ) : (
            <button onClick={login} className={signupStyles.signupButton}>
              Submit
            </button>
          )} */}
          <Link href="/auth/login">
            <a style={{ textDecoration: "none" }}>
              <button
                className={signupStyles.signupButton}
                style={{ marginTop: 4 }}
              >
                Back
              </button>
            </a>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
