import React, { useEffect, useState } from "react";
import { useStateValue } from "../context/StateProvider";
import Header from "../components/Header";
import profileStyles from "../styles/pages/Profile.module.css";
import { auth, db, firebase } from "../services/firebase";
import { useRouter } from "next/router";
import { CircularProgress, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Head from "next/head";

const Profile = () => {
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);
  const [{ user }, dispatch] = useStateValue();
  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const [otp, setOTP] = useState("");
  const [codeResult, setCodeResult] = useState(null);
  const [password, setPassword] = useState("");
  const [editPhno, setEditPhno] = useState(false);
  // const [verified, setVerified] = useState(false);
  const [updating, setUpdating] = useState(false);
  // const [updatingPhno, setUpdatingPhno] = useState(false);
  const [address, setAddress] = useState("");
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
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
            setSendingOTP(false);
          } else {
            alert("Enter a valid Mobile Number");
          }
          setSendingOTP(false);
        } else {
          alert("Phone number already registered!");
          setSendingOTP(false);
        }
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
          .doc(user?.id)
          .update({
            phno,
          })
          .then(() => {
            // setUpdatingPhno(false);
            dispatch({
              type: "SET_USER",
              user: {
                ...user,
                phno,
              },
            });
            alert("Updated!");
          })
          .catch(() => {
            // setUpdatingPhno(false);
            // setVerified(false);
            alert("Error occurred!");
          });
      })
      .catch((error) => {
        alert(error.message);
        setVerifyingOTP(true);
      });
  };
  const updateProfile = (e) => {
    e.preventDefault();
    setUpdating(true);

    if (!(name.length > 2)) {
      alert("Name must be at least 3 characters long");
      setUpdating(false);
    } else if (!(password.length >= 8)) {
      alert("Password must be at least 8 characters long");
      setUpdating(false);
    } else {
      db.collection("Users")
        .doc(user?.id)
        .update({
          name,
          password,
          address,
        })
        .then(() => {
          dispatch({
            type: "SET_USER",
            user: {
              ...user,
              name,
              password,
              address,
            },
          });
          setUpdating(false);
          alert("Updated!");
        })
        .catch(() => {
          setUpdating(false);
          alert("Error occurred!");
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
  //     db.collection("Users")
  //       .doc(user?.id)
  //       .update({
  //         phno,
  //       })
  //       .then(() => {
  //         setUpdatingPhno(false);
  //         dispatch({
  //           type: "SET_USER",
  //           user: {
  //             ...user,
  //             phno,
  //           },
  //         });
  //         alert("Updated!");
  //       })
  //       .catch(() => {
  //         setUpdatingPhno(false);
  //         setVerified(false);
  //         alert("Error occurred!");
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

              setAddress(data.data()?.address);
              setName(data.data()?.name);
              setPassword(data.data()?.password);
              setPhno(data.data()?.phno);
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
      setName(user?.name);
      setPassword(user?.password);
      setPhno(user?.phno);
      setShowLoading(false);
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
        <title>Albela | Profile</title>
      </Head>
      <Header />

      <Snackbar open={open} autoHideDuration={1111} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info">
          {editPhno ? "Phone Number" : "Profile"} updated!
        </Alert>
      </Snackbar>
      {editPhno ? (
        <div className={profileStyles.profile}>
          <div className={profileStyles.form}>
            <h3 style={{ textAlign: "center", marginBottom: "21px" }}>
              Update Mobile No.
            </h3>
            <div
              className={profileStyles.multiContainer}
              style={{ marginBottom: 4 }}
            >
              <input
                value={phno}
                onChange={(e) => setPhno(e.target.value)}
                className={profileStyles.inputs}
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
              className={profileStyles.multiContainer}
              style={{ marginTop: "2px" }}
            >
              <input
                disabled={phno?.length === 10 && codeResult ? false : true}
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
                className={profileStyles.inputs}
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
                onClick={updatePhno}
                className={profileStyles.profileButton}
              >
                Update
              </button>
            )} */}
            <button
              onClick={() => setEditPhno(false)}
              style={{ marginTop: "7px" }}
              className={profileStyles.profileButton}
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <div className={profileStyles.profile}>
          <div className={profileStyles.form}>
            <h3 style={{ textAlign: "center", marginBottom: "21px" }}>
              Update Profile
            </h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={profileStyles.inputs}
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
            />
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className={profileStyles.inputs}
              type="text"
              name="password"
              id="password"
              placeholder="Choose a Password"
              minLength={8}
            />
            <textarea
              placeholder="Enter your Address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
              }}
              style={{ marginTop: "2px" }}
              className={profileStyles.inputs}
              name="address"
              id="address"
              cols="30"
              rows="4"
            ></textarea>
            {updating ? (
              <div style={{ display: "grid", placeItems: "center" }}>
                <CircularProgress size={24} />
              </div>
            ) : (
              <button
                onClick={updateProfile}
                className={profileStyles.profileButton}
              >
                Update
              </button>
            )}
            <button
              onClick={() => setEditPhno(true)}
              style={{ marginTop: "7px" }}
              className={profileStyles.profileButton}
            >
              Edit Mobile No.
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
