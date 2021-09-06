import {
  CircularProgress,
  IconButton,
  makeStyles,
  Snackbar,
} from "@material-ui/core";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useStateValue } from "../../context/StateProvider";
import { db, storage } from "../../services/firebase";
import adsStyles from "../../styles/pages/admin/Ads.module.css";
import AdminHeader from "../../components/admin/AdminHeader";
import { Alert } from "@material-ui/lab";
import RemoveCircleRoundedIcon from "@material-ui/icons/RemoveCircleRounded";
import Head from "next/head";

const Ads = () => {
  const router = useRouter();
  const [{ isAdminValidated }, dispatch] = useStateValue();
  const [ads, setAds] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDeleted, setOpenDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const handleCloseDeleted = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenDeleted(false);
  };

  const uploadImage = () => {
    document.getElementById("uploadImage").click();
  };
  const addAd = async (file) => {
    setAdding(true);
    const storageRef = await storage.ref(`/ads/${file.name}-${new Date()}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();

    db.collection("Ads")
      .add({
        ad: url,
      })
      .then(() => {
        setOpen(true);
        setAdding(false);
      })
      .catch((error) => alert(error));
  };
  const deleteMedia = async (id, url) => {
    if (
      confirm(
        "Are you sure you want to delete this Ad?\n(Click 'OK' and the Ad will be deleted ASAP!)"
      )
    ) {
      await storage.refFromURL(url).delete();
      await db.collection("Ads").doc(id).delete();
      setOpenDeleted(true);
    }
  };

  useEffect(() => {
    if (isAdminValidated) {
      db.collection("Ads").onSnapshot((adsSnapshot) => {
        setAds(
          adsSnapshot.docs.map((doc) => ({
            id: doc.id,
            adLink: doc.data().ad,
          }))
        );
        setLoading(false);
      });
    } else {
      router.replace("/albela-admin");
    }
  }, [isAdminValidated]);

  return loading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div className={adsStyles.adContainer}>
      <Head>
        <title>Albela (Admin) | Ads</title>
      </Head>
      <AdminHeader />
      <Snackbar open={open} autoHideDuration={1111} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info">
          Ad addeed successfully!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openDeleted}
        autoHideDuration={1111}
        onClose={handleCloseDeleted}
      >
        <Alert onClose={handleCloseDeleted} severity="warning">
          Ad deleted successfully!
        </Alert>
      </Snackbar>
      <input
        id="uploadImage"
        type="file"
        accept="image/*"
        hidden
        multiple={false}
        onChange={(e) => addAd(e.target.files[0])}
      />
      <div className={adsStyles.addButtonContainer}>
        {adding ? (
          <CircularProgress style={{ color: "#cd9042" }} />
        ) : (
          <button className={adsStyles.add__button} onClick={uploadImage}>
            Add new Advertisement
          </button>
        )}
      </div>
      <div style={{ backgroundColor: "whitesmoke" }} className={adsStyles.ads}>
        {ads.map((ad) => (
          <div key={ad.id} className={adsStyles.adImageContainer}>
            <img
              style={{ borderColor: "white" }}
              src={ad.adLink}
              className={adsStyles.ad}
            />
            <IconButton
              className={adsStyles.removeButton}
              onClick={() => deleteMedia(ad.id, ad.adLink)}
            >
              <RemoveCircleRoundedIcon
                fontSize="small"
                style={{ color: "red" }}
              />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ads;
