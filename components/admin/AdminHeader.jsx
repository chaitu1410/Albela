import Link from "next/link";
import { useRouter } from "next/router";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import React, { useEffect, useState } from "react";
import MenuRoundedIcon from "@material-ui/icons/MenuRounded";
import MonetizationOnRoundedIcon from "@material-ui/icons/MonetizationOnRounded";
import StoreRoundedIcon from "@material-ui/icons/StoreRounded";
import dashboardHeaderStyles from "../../styles/components/DashboardHeader.module.css";
import headerStyles from "../../styles/components/Header.module.css";
import SearchIcon from "@material-ui/icons/Search";
import adminHeaderStyles from "../../styles/components/admin/AdminHeader.module.css";
import PostAddRoundedIcon from "@material-ui/icons/PostAddRounded";
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import ViewCarouselRoundedIcon from "@material-ui/icons/ViewCarouselRounded";

const DashboardHeader = ({
  forShopListPage,
  searchString,
  setSearchString,
}) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (showMenu) {
      document.getElementById("menu").style.transform = "translateX(0px)";
      document.getElementById("overlay").style.opacity = "1";
    } else {
      document.getElementById("menu").style.transform = "translateX(-100vw)";
      document.getElementById("overlay").style.opacity = "0";
    }
  }, [showMenu]);

  return (
    <div
      className={dashboardHeaderStyles.header}
      style={{ paddingBottom: forShopListPage ? 7 : 0 }}
    >
      {/* Menu */}
      <div className={dashboardHeaderStyles.menu} id="menu">
        <div className={dashboardHeaderStyles.menu_left}>
          {/* <IconButton onClick={() => setShowMenu(false)}>
            <CloseIcon style={{ color: "red" }} />
          </IconButton> */}
          <div className={dashboardHeaderStyles.menu_items}>
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/albela-admin/seller-shops")}
              style={{
                background:
                  router.pathname === "/albela-admin/seller-shops" ||
                  router.pathname === "/albela-admin/seller-shops/[sellerID]" ||
                  router.pathname === "/albela-admin/seller-shops/product/[id]"
                    ? "rgba(0, 0, 0, 0.03)"
                    : "white",
                color:
                  router.pathname === "/albela-admin/seller-shops" ||
                  router.pathname === "/albela-admin/seller-shops/[sellerID]" ||
                  router.pathname === "/albela-admin/seller-shops/product/[id]"
                    ? "black"
                    : "gray",
              }}
            >
              <StoreRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 7,
                  color:
                    router.pathname === "/albela-admin/seller-shops" ||
                    router.pathname ===
                      "/albela-admin/seller-shops/[sellerID]" ||
                    router.pathname ===
                      "/albela-admin/seller-shops/product/[id]"
                      ? "#cd9042"
                      : "lightgray",
                }}
              />
              Shops
              <KeyboardArrowRightRoundedIcon
                style={{
                  marginRight: 7,
                  color: "gray",
                  marginLeft: "auto",
                }}
                fontSize="small"
              />
            </div>
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/albela-admin/orders")}
              style={{
                background:
                  router.pathname === "/albela-admin/orders" ||
                  router.pathname === "/albela-admin/orders"
                    ? "rgba(0, 0, 0, 0.03)"
                    : "white",
                color:
                  router.pathname === "/albela-admin/orders" ||
                  router.pathname === "/albela-admin/orders"
                    ? "black"
                    : "gray",
              }}
            >
              <MonetizationOnRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 7,
                  color:
                    router.pathname === "/albela-admin/orders" ||
                    router.pathname === "/albela-admin/orders"
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
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/albela-admin/add-category")}
              style={{
                background:
                  router.pathname === "/albela-admin/add-category" ||
                  router.pathname === "/albela-admin/add-category"
                    ? "rgba(0, 0, 0, 0.03)"
                    : "white",
                color:
                  router.pathname === "/albela-admin/add-category" ||
                  router.pathname === "/albela-admin/add-category"
                    ? "black"
                    : "gray",
              }}
            >
              <PostAddRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 7,
                  color:
                    router.pathname === "/albela-admin/add-category" ||
                    router.pathname === "/albela-admin/add-category"
                      ? "#cd9042"
                      : "lightgray",
                }}
              />
              Add Category
              <KeyboardArrowRightRoundedIcon
                style={{
                  marginRight: 7,
                  color: "gray",
                  marginLeft: "auto",
                }}
                fontSize="small"
              />
            </div>
            <div
              className={dashboardHeaderStyles.menuItem}
              onClick={() => router.push("/albela-admin/ads")}
              style={{
                background:
                  router.pathname === "/albela-admin/ads"
                    ? "rgba(0, 0, 0, 0.03)"
                    : "white",
                color:
                  router.pathname === "/albela-admin/ads" ? "black" : "gray",
              }}
            >
              <ViewCarouselRoundedIcon
                className={dashboardHeaderStyles.menu_icon}
                style={{
                  marginRight: 7,
                  color:
                    router.pathname === "/albela-admin/ads"
                      ? "#cd9042"
                      : "lightgray",
                }}
              />
              Ads
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

      <div
        className={adminHeaderStyles.nav}
        style={{ paddingBottom: 0, marginBottom: 0 }}
      >
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
        {forShopListPage && (
          <div
            className={headerStyles.header__search}
            style={{ width: "100%", marginBottom: 7, marginRight: 2 }}
          >
            <input
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              type="text"
              placeholder="Search for a Shop"
              className={headerStyles.header__searchInput}
            />
            <SearchIcon className={headerStyles.header__searchIcon} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
