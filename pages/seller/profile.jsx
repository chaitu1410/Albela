import { CircularProgress, Snackbar } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useStateValue } from "../../context/StateProvider";
import { auth, db, firebase } from "../../services/firebase";
import sellerStyles from "../../styles/pages/seller/SellerRegister.module.css";
import { useRouter } from "next/router";
import DashboardHeader from "../../components/seller/DashboardHeader";
import { Alert } from "@material-ui/lab";
import Head from "next/head";

const SellerProfile = () => {
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
  const [updating, setUpdating] = useState(false);
  // const [updatingPhno, setUpdatingPhno] = useState(false);
  const [editPhno, setEditPhno] = useState(false);
  // const [verified, setVerified] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

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
        if (result.user) {
          db.collection("Sellers")
            .doc(user?.sellerID)
            .update({
              phno,
            })
            .then(() => {
              // setUpdatingPhno(false);
              setOpen(true);
            })
            .catch(() => {
              // setUpdatingPhno(false);
              alert("Error occurred!");
              // setVerified(false);
            });
        }
      })
      .catch((error) => {
        alert(error.message);
        setVerifyingOTP(false);
      });
  };
  const register = (e) => {
    setUpdating(true);
    e.preventDefault();

    if (!(name.length > 2)) {
      alert("Name must be at least 3 characters long");
      setUpdating(false);
    } else if (
      !(email.length >= 5) ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      alert("Enter a valid email");
      setUpdating(false);
    } else if (!(shopName.length >= 4)) {
      alert("Shop name must be at least 4 characters long");
      setUpdating(false);
    } else if (!(shopAddress.length >= 10)) {
      alert("Shop address must be at least 10 characters long");
      setUpdating(false);
    } else {
      db.collection("Sellers")
        .doc(user?.sellerID)
        .update({
          name,
          email,
          shopName,
          shopAddress,
          shopCity,
        })
        .then((data) => {
          setOpen(true);
          setUpdating(false);
        })
        .catch((error) => {
          alert(error.message);
          setUpdating(false);
        });
    }
  };
  // const updatePhno = (e) => {
  //   e.preventDefault();
  //   setUpdatingPhno(true);

  //   if (!codeResult || (codeResult && !codeResult.verificationId)) {
  //     alert("Verify your Pone number first");
  //     setUpdatingPhno(false);
  //   } else if (
  //     !(phno.trim().length === 10) ||
  //     (codeResult !== null && !codeResult.verificationId)
  //   ) {
  //     alert("Enter a valid Mobile number that you have verified");
  //     setUpdatingPhno(false);
  //   } else if (!(otp.trim().length === 6) || !verified) {
  //     alert("OTP is mandatory and must be verified");
  //     setUpdatingPhno(false);
  //   } else {
  //     db.collection("Sellers")
  //       .doc(user?.sellerID)
  //       .update({
  //         phno,
  //       })
  //       .then(() => {
  //         setUpdatingPhno(false);
  //         setOpen(true);
  //       })
  //       .catch(() => {
  //         setUpdatingPhno(false);
  //         alert("Error occurred!");
  //         setVerified(false);
  //       });
  //   }
  // };

  useEffect(() => {
    if (editPhno) {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        "verifier",
        { size: "invisible" }
      );
      recaptchaVerifier
        .render()
        .then((widgetId) => (window.recaptchaWidgetId = widgetId));
    }
  }, [editPhno]);

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
                  setName(sellerData.data().name);
                  setPhno(sellerData.data().phno);
                  setEmail(sellerData.data().email);
                  setShopName(sellerData.data().shopName);
                  setShopAddress(sellerData.data().shopAddress);
                  setShopCity(sellerData.data().shopCity);
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
            setName(sellerData.data().name);
            setPhno(sellerData.data().phno);
            setEmail(sellerData.data().email);
            setShopName(sellerData.data().shopName);
            setShopAddress(sellerData.data().shopAddress);
            setShopCity(sellerData.data().shopCity);
            setShowLoading(false);
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
    <>
      <Head>
        <title>Albela (Seller) | Profile</title>
      </Head>
      <DashboardHeader />
      <Snackbar open={open} autoHideDuration={1111} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info">
          {editPhno ? "Phone Number" : "Profile"} updated!
        </Alert>
      </Snackbar>
      {editPhno ? (
        <div className={sellerStyles.seller}>
          <div className={sellerStyles.form}>
            <h3 style={{ textAlign: "center" }}>Update Phone Number</h3>
            <div
              className={sellerStyles.multiContainer}
              style={{ marginBottom: 4, marginTop: 7 }}
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
            <div
              className={sellerStyles.multiContainer}
              style={{ marginTop: "2px" }}
            >
              <input
                disabled={phno.length === 10 && codeResult ? false : true}
                value={otp}
                onChange={(e) => {
                  setOTP(e.target.value);
                }}
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
            {/* {updatingPhno ? (
              <div style={{ display: "grid", placeItems: "center" }}>
                <CircularProgress size={24} />
              </div>
            ) : (
              <button
                id="editPhNo"
                style={{ marginBottom: 4 }}
                onClick={updatePhno}
                className={sellerStyles.sellerButton}
              >
                Update
              </button>
            )} */}
            <button
              onClick={() => setEditPhno(false)}
              style={{ marginTop: "7px" }}
              className={sellerStyles.sellerButton}
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <div className={sellerStyles.seller}>
          <div className={sellerStyles.form}>
            <h3 style={{ textAlign: "center" }}>Update Seller Account</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={sellerStyles.inputs}
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
            />

            <input
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
              value={shopAddress}
              onChange={(e) => {
                setShopAddress(e.target.value);
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
            {updating ? (
              <div style={{ display: "grid", placeItems: "center" }}>
                <CircularProgress size={24} />
              </div>
            ) : (
              <button
                onClick={register}
                id="updateButton"
                style={{ marginTop: 4 }}
                className={sellerStyles.sellerButton}
              >
                Update
              </button>
            )}
            <button
              onClick={() => setEditPhno(true)}
              className={sellerStyles.sellerButton}
              style={{ marginTop: 4 }}
            >
              Edit Phone No.
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerProfile;
