import { CircularProgress } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useStateValue } from "../../context/StateProvider";
import { auth, db, firebase } from "../../services/firebase";
import sellerStyles from "../../styles/pages/seller/SellerRegister.module.css";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Head from "next/head";

const RegisterSeller = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const [otp, setOTP] = useState("");
  const [codeResult, setCodeResult] = useState(null);
  const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  // const [shopCategory, setShopCategory] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopCity, setShopCity] = useState("Jalgaon");
  const [{ user }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [registering, setRegistering] = useState(false);

  const getOTP = async (e) => {
    e.preventDefault();
    setSendingOTP(true);

    db.collection("Sellers")
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
        document.getElementById("email").disabled = false;
      })
      .catch((error) => {
        alert(error.message);
        setVerifyingOTP(false);
      });
  };
  const register = (e) => {
    setRegistering(true);
    e.preventDefault();

    if (!codeResult || (codeResult && !codeResult.verificationId)) {
      alert("Verify your Pone number first");
      setRegistering(false);
    } else if (!(name.length > 2)) {
      alert("Name must be at least 3 characters long");
      setRegistering(false);
    } else if (
      !(phno.length === 10) ||
      (codeResult !== null && !codeResult.verificationId)
    ) {
      alert("Enter a valid Mobile number that you have verified");
      setRegistering(false);
    } else if (
      !(email.length >= 5) ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      alert("Enter a valid email");
      setRegistering(false);
    } else if (!(shopName.length >= 4)) {
      alert("Shop name must be at least 4 characters long");
      setRegistering(false);
    } else if (!(shopAddress.length >= 10)) {
      alert("Shop address must be at least 10 characters long");
      setRegistering(false);
    } else {
      db.collection("Sellers")
        .add({
          name,
          phno,
          email,
          shopName,
          shopAddress,
          shopCity,
          rechargeValidity: new Date().getTime(),
          isVIP: false,
        })
        .then((data) => {
          db.collection("Users")
            .doc(user?.id)
            .update({
              isSeller: true,
              sellerID: data.id,
            })
            .then(() => {
              dispatch({
                type: "SET_USER",
                user: {
                  ...user,
                  isSeller: true,
                  sellerID: data.id,
                },
              });
              setRegistering(false);
              router.replace(`/seller/recharge`);
            });
        })
        .catch((error) => {
          alert(error.message);
          setRegistering(false);
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
              if (data.data().isSeller) {
                router.replace(`/seller/profile`);
              } else {
                setShowLoading(false);
              }
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
      if (user?.isSeller) {
        router.replace(`/seller/profile`);
      }
    }
  }, []);

  useEffect(() => {
    if (user && !user?.isSeller) {
      setName(user?.name);
      setPhno(user?.phno);
    }
  }, [user]);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <>
      <Head>
        <title>Albela (Seller) | Register as a Seller</title>
      </Head>
      <Header />
      <div className={sellerStyles.seller}>
        <div className={sellerStyles.form}>
          <h3 style={{ textAlign: "center" }}>Register your Shop</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={sellerStyles.inputs}
            type="text"
            name="name"
            id="name"
            placeholder="Enter your name"
          />
          <div
            className={sellerStyles.multiContainer}
            style={{ marginBottom: 4 }}
          >
            <input
              disabled={name.length > 2 ? false : true}
              value={phno}
              onChange={(e) => setPhno(e.target.value)}
              className={sellerStyles.inputs}
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
            className={sellerStyles.multiContainer}
            style={{ marginTop: "2px" }}
          >
            <input
              disabled={phno.length === 10 && codeResult ? false : true}
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              className={sellerStyles.inputs}
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
            disabled
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              e.target.value.trim().length >= 5
                ? (document.getElementById("shopName").disabled = false)
                : (document.getElementById("shopName").disabled = true);
            }}
            className={sellerStyles.inputs}
            type="email"
            name="email"
            id="email"
            placeholder="Enter your E-mail"
          />
          <input
            value={shopName}
            disabled
            onChange={(e) => {
              setShopName(e.target.value);
              e.target.value.trim().length >= 4
                ? (document.getElementById("shopAddress").disabled = false)
                : (document.getElementById("shopAddress").disabled = true);
            }}
            className={sellerStyles.inputs}
            type="text"
            name="shopName"
            id="shopName"
            placeholder="Enter your Shop name"
          />
          <textarea
            placeholder="Enter your Address"
            disabled
            value={shopAddress}
            onChange={(e) => {
              setShopAddress(e.target.value);
              shopAddress.trim().length >= 10
                ? (document.getElementById("registerButton").disabled = false)
                : (document.getElementById("registerButton").disabled = true);
            }}
            style={{ marginTop: "2px" }}
            className={sellerStyles.inputs}
            name="shopAddress"
            id="shopAddress"
            cols="30"
            rows="10"
          ></textarea>
          <input
            value={shopCity}
            disabled
            onChange={(e) => setShopCity(e.target.value)}
            className={sellerStyles.inputs}
            type="text"
            name="shopCity"
            id="shopCity"
            placeholder="Enter your Shop's locality(City)"
          />
          {registering ? (
            <div style={{ display: "grid", placeItems: "center" }}>
              <CircularProgress size={24} />
            </div>
          ) : (
            <button
              onClick={register}
              id="registerButton"
              className={sellerStyles.sellerButton}
            >
              Register
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default RegisterSeller;
