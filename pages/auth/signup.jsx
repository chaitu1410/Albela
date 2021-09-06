import React, { useEffect, useState } from "react";
import { useStateValue } from "../../context/StateProvider";
import { auth, db, firebase } from "../../services/firebase";
import signupStyles from "../../styles/pages/Signup.module.css";
import Router from "next/router";
import Header from "../../components/Header";
import { CircularProgress } from "@material-ui/core";
import Link from "next/link";
import Head from "next/head";

const Signup = () => {
  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const [otp, setOTP] = useState("");
  const [codeResult, setCodeResult] = useState(null);
  const [password, setPassword] = useState("");
  const [{ user }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  const getOTP = async (e) => {
    e.preventDefault();
    setSendingOTP(true);

    db.collection("Users")
      .where("phno", "==", phno)
      .get()
      .then(async (data) => {
        if (data.empty) {
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
        } else {
          alert("Phone number already registered!");
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
        setVerifyingOTP(false);
        if (result.user) {
          document.getElementById("password").disabled = false;
        }
      })
      .catch((error) => {
        alert(error.message);
        setVerifyingOTP(false);
      });
  };
  const signUp = (e) => {
    setSigningUp(true);
    e.preventDefault();

    if (!(name.length > 2)) {
      alert("Name must be at least 3 characters long");
      setSigningUp(false);
    } else if (
      !(phno.length === 10) ||
      (codeResult !== null && !codeResult.verificationId)
    ) {
      alert("Enter a valid Mobile number that you have verified");
      setSigningUp(false);
    } else if (!(password.length >= 8)) {
      alert("Password must be at least 8 characters long");
      setSigningUp(false);
    } else {
      db.collection("Users")
        .add({
          name,
          phno,
          password,
          basket: [],
          address: "",
          isSeller: false,
          sellerID: "",
        })
        .then((data) => {
          dispatch({
            type: "SET_USER",
            user: {
              id: data.id,
              name,
              phno,
              password,
              address: "",
              isSeller: false,
              sellerID: "",
            },
          });
          dispatch({
            type: "SET_BASKET",
            basket: [],
          });
          localStorage.setItem("albelaUserID", data.id);
          setSigningUp(false);
          Router.replace("/");
        })
        .catch((error) => {
          alert(error.message);
          setSigningUp(false);
        });
    }
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
        <title>Albela | Sign Up</title>
      </Head>
      <Header forAuth forPayments />
      <div className={signupStyles.signup}>
        <div className={signupStyles.form}>
          <h3 style={{ textAlign: "center" }}>Sign Up</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={signupStyles.inputs}
            type="text"
            name="name"
            id="name"
            placeholder="Enter your name"
          />
          <div
            className={signupStyles.multiContainer}
            style={{ marginBottom: 4 }}
          >
            <input
              disabled={name.length > 2 ? false : true}
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
          <input
            value={password}
            disabled
            onChange={(e) => setPassword(e.target.value)}
            className={signupStyles.inputs}
            type="text"
            name="password"
            id="password"
            placeholder="Choose a Password"
            minLength={8}
          />
          {signingUp ? (
            <div style={{ display: "grid", placeItems: "center" }}>
              <CircularProgress size={24} />
            </div>
          ) : (
            <button
              onClick={signUp}
              style={{}}
              className={signupStyles.signupButton}
            >
              Sign Up
            </button>
          )}
          <Link href="/auth/login">
            <a style={{ textDecoration: "none" }}>
              <button
                className={signupStyles.signupButton}
                style={{ marginTop: 4 }}
              >
                Already have an account? Login here
              </button>
            </a>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Signup;
