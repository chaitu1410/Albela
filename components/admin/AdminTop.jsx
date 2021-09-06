import {
  CircularProgress,
  FormControlLabel,
  Switch,
  withStyles,
} from "@material-ui/core";
import { green, lightGreen, purple, red } from "@material-ui/core/colors";
import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import adminTopStyles from "../../styles/components/admin/AdminTop.module.css";

const VIPSwitch = withStyles((theme) => ({
  switchBase: {
    color: "white",
    "&$checked": {
      color: "white",
      "& + $track": {
        backgroundColor: "#52d869",
        opacity: 1,
        border: "none",
      },
    },
    "&$checked + $track": {
      backgroundColor: lightGreen[500],
    },
  },
  track: {
    borderRadius: 26 / 2,
    backgroundColor: "red",
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const AdminTop = ({ sellerID }) => {
  const [isVIP, setVIP] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [rechargeValidity, setRechargeValidity] = useState("");

  useEffect(() => {
    const snapshotUnsubscription = db
      .collection("Sellers")
      .doc(sellerID)
      .onSnapshot((snapshot) => {
        setVIP(snapshot.data().isVIP);
        setRechargeValidity(snapshot.data().rechargeValidity);
        setShowLoading(false);
      });

    return () => snapshotUnsubscription();
  }, []);

  const handleVIPChange = () => {
    db.collection("Sellers").doc(sellerID).update({
      isVIP: !isVIP,
    });
  };

  return (
    <div className={adminTopStyles.top}>
      {showLoading ? (
        <CircularProgress size={30} style={{ color: "#cd9042" }} />
      ) : (
        <p>
          {isVIP ? "🌟" : rechargeValidity > new Date().getTime() ? "🟢" : "🔴"}
        </p>
      )}
      {showLoading ? (
        <CircularProgress size={30} style={{ color: "#cd9042" }} />
      ) : (
        <FormControlLabel
          style={{ color: "white", display: "inline-flex" }}
          labelPlacement="start"
          control={
            <VIPSwitch
              checked={isVIP}
              onChange={handleVIPChange}
              name="isVIP"
            />
          }
          label="VIP"
        />
      )}
    </div>
  );
};

export default AdminTop;
