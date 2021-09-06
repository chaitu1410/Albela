import Link from "next/link";
import { useRouter } from "next/router";
import {
  Badge,
  ClickAwayListener,
  IconButton,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import React, { useEffect, useState } from "react";
import MenuRoundedIcon from "@material-ui/icons/MenuRounded";
import PaymentRoundedIcon from "@material-ui/icons/PaymentRounded";
import DeleteSweepRoundedIcon from "@material-ui/icons/DeleteSweepRounded";
import PersonOutlineRoundedIcon from "@material-ui/icons/PersonOutlineRounded";
import MonetizationOnRoundedIcon from "@material-ui/icons/MonetizationOnRounded";
import AddShoppingCartRoundedIcon from "@material-ui/icons/AddShoppingCartRounded";
import NotificationsNoneRoundedIcon from "@material-ui/icons/NotificationsNoneRounded";
import dashboardHeaderStyles from "../../styles/components/DashboardHeader.module.css";
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import { useStateValue } from "../../context/StateProvider";
import { db } from "../../services/firebase";

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: 12,
  },
}));

const DashboardHeader = () => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [{ user }, dispatch] = useStateValue();
  const [isValidityExpired, setIsValidityExpired] = useState(false);
  const [open, setOpen] = React.useState(false);
  const classes = useStylesBootstrap();

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (showMenu) {
      document.getElementById("menu").style.transform = "translateX(0px)";
      document.getElementById("overlay").style.opacity = "1";
    } else {
      document.getElementById("menu").style.transform = "translateX(-100vw)";
      document.getElementById("overlay").style.opacity = "0";
    }
  }, [showMenu]);

  useEffect(() => {
    db.collection("Sellers")
      .doc(user?.sellerID)
      .get()
      .then((data) =>
        setIsValidityExpired(
          data.data().rechargeValidity < new Date().getTime()
        )
      );
  }, []);

  return (
    <div className={dashboardHeaderStyles.header}>
      {/* Menu */}
      <div className={dashboardHeaderStyles.menu} id="menu">
        <div className={dashboardHeaderStyles.menu_left}>
          {/* <IconButton onClick={() => setShowMenu(false)}>
            <CloseIcon style={{ color: "red" }} />
          </IconButton> */}
          <div className={dashboardHeaderStyles.menu_items}>
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/")}
              style={{
                background: "white",
                color: "gray",
              }}
            >
              <HomeRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 15,
                  color: "lightgray",
                }}
              />
              Home
              <KeyboardArrowRightRoundedIcon
                style={{
                  marginRight: 7,
                  color: "gray",
                  marginLeft: "auto",
                }}
                fontSize="small"
              />
            </div>
          </div>
          <div className={dashboardHeaderStyles.menu_items}>
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/seller/profile")}
              style={{
                background:
                  router.pathname === "/seller/profile"
                    ? "rgba(0, 0, 0, 0.03)"
                    : "white",
                color: router.pathname === "/seller/profile" ? "black" : "gray",
              }}
            >
              <PersonOutlineRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 15,
                  color:
                    router.pathname === "/seller/profile"
                      ? "#cd9042"
                      : "lightgray",
                }}
              />
              Seller Profile
              <KeyboardArrowRightRoundedIcon
                style={{
                  marginRight: 7,
                  color: "gray",
                  marginLeft: "auto",
                }}
                fontSize="small"
              />
            </div>
          </div>
          <div className={dashboardHeaderStyles.menu_items}>
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/seller/add-product")}
              style={{
                background:
                  router.pathname === "/seller/add-product"
                    ? "rgba(0, 0, 0, 0.03)"
                    : "white",
                color:
                  router.pathname === "/seller/add-product" ? "black" : "gray",
              }}
            >
              <AddShoppingCartRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 15,
                  color:
                    router.pathname === "/seller/add-product"
                      ? "#cd9042"
                      : "lightgray",
                }}
              />
              Add Product
              <KeyboardArrowRightRoundedIcon
                style={{
                  marginRight: 7,
                  color: "gray",
                  marginLeft: "auto",
                }}
                fontSize="small"
              />
            </div>
          </div>
          <div className={dashboardHeaderStyles.menu_items}>
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/seller/edit-delete-products")}
              style={{
                background:
                  router.pathname === "/seller/edit-delete-products" ||
                  router.pathname === "/seller/edit-product"
                    ? "rgba(0, 0, 0, 0.03)"
                    : "white",
                color:
                  router.pathname === "/seller/edit-delete-products" ||
                  router.pathname === "/seller/edit-product"
                    ? "black"
                    : "gray",
              }}
            >
              <DeleteSweepRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 15,
                  color:
                    router.pathname === "/seller/edit-delete-products" ||
                    router.pathname === "/seller/edit-product"
                      ? "#cd9042"
                      : "lightgray",
                }}
              />
              Edit/Delete Products
              <KeyboardArrowRightRoundedIcon
                style={{
                  marginRight: 7,
                  color: "gray",
                  marginLeft: "auto",
                }}
                fontSize="small"
              />
            </div>
          </div>
          <div className={dashboardHeaderStyles.menu_items}>
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/seller/orders")}
              style={{
                background:
                  router.pathname === "/seller/orders" ||
                  router.pathname === "/seller/orders"
                    ? "rgba(0, 0, 0, 0.03)"
                    : "white",
                color:
                  router.pathname === "/seller/orders" ||
                  router.pathname === "/seller/orders"
                    ? "black"
                    : "gray",
              }}
            >
              <MonetizationOnRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 15,
                  color:
                    router.pathname === "/seller/orders" ||
                    router.pathname === "/seller/orders"
                      ? "#cd9042"
                      : "lightgray",
                }}
              />
              Orders
              <KeyboardArrowRightRoundedIcon
                style={{
                  marginRight: 7,
                  color: "gray",
                  marginLeft: "auto",
                }}
                fontSize="small"
              />
            </div>
          </div>
          <div className={dashboardHeaderStyles.menu_items}>
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/seller/recharge")}
              style={{
                background:
                  router.pathname === "/seller/recharge"
                    ? "rgba(0, 0, 0, 0.03)"
                    : "white",
                color:
                  router.pathname === "/seller/recharge" ? "black" : "gray",
              }}
            >
              <PaymentRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 15,
                  color:
                    router.pathname === "/seller/recharge"
                      ? "#cd9042"
                      : "lightgray",
                }}
              />
              Recharge
              <KeyboardArrowRightRoundedIcon
                style={{
                  marginRight: 7,
                  color: "gray",
                  marginLeft: "auto",
                }}
                fontSize="small"
              />
            </div>
          </div>
        </div>
        <div
          className={dashboardHeaderStyles.menu_overlay}
          id="overlay"
          onClick={() => setShowMenu(false)}
          onScroll={() => setShowMenu(false)}
          onTouchMove={() => setShowMenu(false)}
          onTouchStart={() => setShowMenu(false)}
        ></div>
      </div>

      <div className={dashboardHeaderStyles.nav}>
        <div className={dashboardHeaderStyles.left}>
          <IconButton onClick={() => setShowMenu(true)}>
            <MenuRoundedIcon style={{ color: "white" }} />
          </IconButton>
          <Link href="/">
            <a>
              <img
                src="/assets/icon.png"
                className={dashboardHeaderStyles.header__logo}
                alt=""
              />
            </a>
          </Link>
        </div>
        {isValidityExpired ? (
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <Tooltip
              title="Your Seller subscription has expired. Recharge now to showcase your products on Albela and grow your business!"
              arrow
              classes={classes}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              PopperProps={{
                disablePortal: true,
              }}
              onClose={handleTooltipClose}
              open={open}
            >
              <IconButton onClick={handleTooltipOpen}>
                <Badge
                  variant="dot"
                  color="error"
                  invisible={!isValidityExpired}
                >
                  <NotificationsNoneRoundedIcon style={{ color: "white" }} />
                </Badge>
              </IconButton>
            </Tooltip>
          </ClickAwayListener>
        ) : (
          <NotificationsNoneRoundedIcon
            style={{ color: "white", marginRight: 11 }}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
