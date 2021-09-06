import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ShoppingCartRoundedIcon from "@material-ui/icons/ShoppingCartRounded";
import SearchIcon from "@material-ui/icons/Search";
import headerStyles from "../styles/components/Header.module.css";
import { useStateValue } from "../context/StateProvider";
import { IconButton, makeStyles, TextField, Tooltip } from "@material-ui/core";
import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";
import LocalShippingRoundedIcon from "@material-ui/icons/LocalShippingRounded";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import MonetizationOnRoundedIcon from "@material-ui/icons/MonetizationOnRounded";
import ExitToAppRoundedIcon from "@material-ui/icons/ExitToAppRounded";
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import PersonAddRoundedIcon from "@material-ui/icons/PersonAddRounded";
import { Autocomplete } from "@material-ui/lab";
import { db } from "../services/firebase";
import CategoryRoundedIcon from "@material-ui/icons/CategoryRounded";

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
  },
}));

function BootstrapTooltip(props) {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} />;
}

const Header = ({ forPayments = false, forAuth = false }) => {
  const router = useRouter();
  const [{ basket, user }, dispatch] = useStateValue();
  const [searchString, setSearchString] = useState("");
  const [products, setProducts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!forAuth) {
      if (showMenu) {
        document.getElementById("menu").style.transform = "translateX(0px)";
        document.getElementById("overlay").style.opacity = "1";
      } else {
        document.getElementById("menu").style.transform = "translateX(-100vw)";
        document.getElementById("overlay").style.opacity = "0";
      }
    }
  }, [showMenu]);

  useEffect(() => {
    db.collection("Products")
      .orderBy("name")
      .get()
      .then((snapshot) =>
        setProducts(snapshot.docs.map((doc) => doc.data().name))
      );
  }, []);

  return (
    <>
      <div className={headerStyles.pc_header}>
        <Link href="/">
          <a>
            <img
              src="/assets/icon.png"
              className={headerStyles.header__logo}
              alt=""
            />
          </a>
        </Link>

        {!forPayments && (
          <div className={headerStyles.header__search}>
            <Autocomplete
              freeSolo
              onChange={(e, v) => {
                if (v && v.trim().length > 0) {
                  router.push(`/search/${v}`);
                  setSearchString("");
                }
              }}
              inputValue={searchString}
              onInputChange={(e, v) => setSearchString(v)}
              className={headerStyles.header__autocomplete}
              id="custom-input-demo"
              options={[...products, searchString]}
              renderInput={(params) => (
                <div
                  ref={params.InputProps.ref}
                  className={headerStyles.header__autocompleteDiv}
                >
                  <input
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      height: "100%",
                      fontSize: 16,
                      padding: 7,
                      paddingLeft: 11,
                      paddingRight: 11,
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                    }}
                    placeholder="Search for a Product"
                    className={headerStyles.header__searchInput}
                    type="text"
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        searchString.trim().length > 0
                      ) {
                        router.push(`/search/${searchString}`);
                      }
                    }}
                    {...params.inputProps}
                  />
                </div>
              )}
            />
            <Link
              href={
                searchString.trim().length > 0 ? `/search/${searchString}` : "/"
              }
            >
              <a className={headerStyles.searchButton}>
                <SearchIcon className={headerStyles.header__searchIcon} />
              </a>
            </Link>
          </div>
        )}

        {!forAuth ? (
          <div className={headerStyles.header__nav}>
            <BootstrapTooltip title="Home">
              <IconButton onClick={() => router.push(`/`)}>
                <HomeRoundedIcon style={{ color: "white" }} />
              </IconButton>
            </BootstrapTooltip>
            {user ? (
              user?.isSeller ? (
                <BootstrapTooltip title="Seller Profile">
                  <IconButton onClick={() => router.push(`/seller/profile`)}>
                    <MonetizationOnRoundedIcon style={{ color: "white" }} />
                  </IconButton>
                </BootstrapTooltip>
              ) : (
                <BootstrapTooltip title="Sell on Albela">
                  <IconButton onClick={() => router.push("/seller/register")}>
                    <MonetizationOnRoundedIcon style={{ color: "white" }} />
                  </IconButton>
                </BootstrapTooltip>
              )
            ) : (
              <></>
            )}
            {user ? (
              <BootstrapTooltip title="Profile">
                <IconButton onClick={() => router.push("/profile")}>
                  <AccountCircleRoundedIcon style={{ color: "white" }} />
                </IconButton>
              </BootstrapTooltip>
            ) : (
              <BootstrapTooltip title="Log In">
                <IconButton onClick={() => router.push("/auth/login")}>
                  <AccountCircleRoundedIcon style={{ color: "white" }} />
                </IconButton>
              </BootstrapTooltip>
            )}
            {user ? (
              <BootstrapTooltip title="Log Out">
                <IconButton
                  onClick={() => {
                    localStorage.removeItem("albelaUserID");
                    dispatch({
                      type: "SET_USER",
                      user: null,
                    });
                    dispatch({
                      type: "EMPTY_BASKET",
                    });
                    router.push("/auth/login");
                  }}
                >
                  <ExitToAppRoundedIcon style={{ color: "white" }} />
                </IconButton>
              </BootstrapTooltip>
            ) : (
              <></>
            )}
            {user ? (
              <BootstrapTooltip title="Your Orders and Tracking">
                <IconButton onClick={() => router.push("/orders")}>
                  <LocalShippingRoundedIcon style={{ color: "white" }} />
                </IconButton>
              </BootstrapTooltip>
            ) : (
              <></>
            )}
            {user ? (
              <Link href="/checkout">
                <a className={headerStyles.checkoutLink}>
                  <BootstrapTooltip title="Cart/Basket">
                    <div className={headerStyles.header__optionBasket}>
                      <ShoppingCartRoundedIcon />
                      <span
                        className={[
                          headerStyles.header__optionLineTwo,
                          headerStyles.header__basketCount,
                        ]}
                      >
                        {basket?.length}
                      </span>
                    </div>
                  </BootstrapTooltip>
                </a>
              </Link>
            ) : (
              <BootstrapTooltip title="Log In to Access Basket">
                <div
                  className={headerStyles.header__optionBasket}
                  onClick={() =>
                    confirm(
                      "You must Login first in order to access your Basket"
                    )
                      ? router.push("/auth/login")
                      : null
                  }
                >
                  <ShoppingCartRoundedIcon />
                </div>
              </BootstrapTooltip>
            )}
          </div>
        ) : (
          <BootstrapTooltip title="Home">
            <IconButton onClick={() => router.push(`/`)}>
              <HomeRoundedIcon style={{ color: "white" }} />
            </IconButton>
          </BootstrapTooltip>
        )}
      </div>

      <div
        className={headerStyles.mobile_header}
        style={{ paddingTop: forAuth || forPayments ? 11 : 0 }}
      >
        {/* Menu */}
        {!forAuth && (
          <div className={headerStyles.menu} id="menu">
            <div className={headerStyles.menu_left}>
              {/* <IconButton onClick={() => setShowMenu(false)}>
                <CloseIcon style={{ color: "black" }} />
              </IconButton> */}
              <div className={headerStyles.menu_items}>
                <div className={headerStyles.menu_top}>
                  Hello,{" "}
                  {user ? (
                    user?.name
                  ) : (
                    <Link href="/auth/login">
                      <a style={{ textDecoration: "none", color: "#cd9042" }}>
                        Log In
                      </a>
                    </Link>
                  )}
                </div>
                <div
                  className={headerStyles.menuItem}
                  onClick={() => router.push("/")}
                  style={{
                    background:
                      router.pathname === "/" ||
                      router.pathname === "/search/[searchString]" ||
                      router.pathname === "/product/[id]" ||
                      router.pathname === "/category/[category]" ||
                      router.pathname === "/checkout"
                        ? "rgba(0, 0, 0, 0.03)"
                        : "white",
                    color:
                      router.pathname === "/" ||
                      router.pathname === "/search/[searchString]" ||
                      router.pathname === "/product/[id]" ||
                      router.pathname === "/category/[category]" ||
                      router.pathname === "/checkout"
                        ? "black"
                        : "gray",
                  }}
                >
                  <HomeRoundedIcon
                    style={{
                      color:
                        router.pathname === "/" ||
                        router.pathname === "/search/[searchString]" ||
                        router.pathname === "/product/[id]" ||
                        router.pathname === "/category/[category]" ||
                        router.pathname === "/checkout"
                          ? "#cd9042"
                          : "lightgray",
                      marginRight: 11,
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
                {user && (
                  <div
                    className={headerStyles.menuItem}
                    onClick={() => router.push("/profile")}
                    style={{
                      background:
                        router.pathname === "/profile"
                          ? "rgba(0, 0, 0, 0.03)"
                          : "white",
                      color: router.pathname === "/profile" ? "black" : "gray",
                    }}
                  >
                    <AccountCircleRoundedIcon
                      style={{
                        color:
                          router.pathname === "/profile"
                            ? "#cd9042"
                            : "lightgray",
                        marginRight: 11,
                      }}
                    />
                    Profile
                    <KeyboardArrowRightRoundedIcon
                      style={{
                        marginRight: 7,
                        color: "gray",
                        marginLeft: "auto",
                      }}
                      fontSize="small"
                    />
                  </div>
                )}
                <div
                  className={headerStyles.menuItem}
                  onClick={() => router.push("/all-categories")}
                  style={{
                    background:
                      router.pathname === "/all-categories"
                        ? "rgba(0, 0, 0, 0.03)"
                        : "white",
                    color:
                      router.pathname === "/all-categories" ? "black" : "gray",
                  }}
                >
                  <CategoryRoundedIcon
                    style={{
                      color:
                        router.pathname === "/all-categories"
                          ? "#cd9042"
                          : "lightgray",
                      marginRight: 11,
                    }}
                  />
                  Shop by Category
                  <KeyboardArrowRightRoundedIcon
                    style={{
                      marginRight: 7,
                      color: "gray",
                      marginLeft: "auto",
                    }}
                    fontSize="small"
                  />
                </div>
                {user && (
                  <div
                    className={headerStyles.menuItem}
                    onClick={() => router.push("/orders")}
                    style={{
                      background:
                        router.pathname === "/orders"
                          ? "rgba(0, 0, 0, 0.03)"
                          : "white",
                      color: router.pathname === "/orders" ? "black" : "gray",
                    }}
                  >
                    <LocalShippingRoundedIcon
                      style={{
                        color:
                          router.pathname === "/orders"
                            ? "#cd9042"
                            : "lightgray",
                        marginRight: 11,
                      }}
                    />
                    Your Orders
                    <KeyboardArrowRightRoundedIcon
                      style={{
                        marginRight: 7,
                        color: "gray",
                        marginLeft: "auto",
                      }}
                      fontSize="small"
                    />
                  </div>
                )}
                {user &&
                  (user?.isSeller ? (
                    <div
                      className={headerStyles.menuItem}
                      onClick={() => router.push(`/seller/profile`)}
                      style={{
                        background:
                          router.pathname === "/seller/profile"
                            ? "rgba(0, 0, 0, 0.03)"
                            : "white",
                        color:
                          router.pathname === "/seller/profile"
                            ? "black"
                            : "gray",
                      }}
                    >
                      <MonetizationOnRoundedIcon
                        style={{
                          color:
                            router.pathname === `/seller/profile`
                              ? "#cd9042"
                              : "lightgray",
                          marginRight: 11,
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
                  ) : (
                    <div
                      className={headerStyles.menuItem}
                      onClick={() => router.push("/seller/register")}
                      style={{
                        background:
                          router.pathname === "/seller/register"
                            ? "rgba(0, 0, 0, 0.03)"
                            : "white",
                        color:
                          router.pathname === "/seller/register"
                            ? "black"
                            : "gray",
                      }}
                    >
                      <MonetizationOnRoundedIcon
                        style={{
                          color:
                            router.pathname === "/seller/register"
                              ? "#cd9042"
                              : "lightgray",
                          marginRight: 11,
                        }}
                      />
                      Sell on Albela
                      <KeyboardArrowRightRoundedIcon
                        style={{
                          marginRight: 7,
                          color: "gray",
                          marginLeft: "auto",
                        }}
                        fontSize="small"
                      />
                    </div>
                  ))}
              </div>
              {user && (
                <div
                  className={headerStyles.menuItem}
                  onClick={() => {
                    localStorage.removeItem("albelaUserID");
                    dispatch({
                      type: "SET_USER",
                      user: null,
                    });
                    dispatch({
                      type: "EMPTY_BASKET",
                    });
                    router.push("/auth/login");
                  }}
                  style={{
                    color: "gray",
                  }}
                >
                  <ExitToAppRoundedIcon
                    style={{ color: "lightgray", marginRight: 11 }}
                  />
                  Log Out
                  <KeyboardArrowRightRoundedIcon
                    style={{
                      marginRight: 7,
                      color: "gray",
                      marginLeft: "auto",
                    }}
                    fontSize="small"
                  />
                </div>
              )}
              {!user && (
                <div
                  className={headerStyles.menuItem}
                  onClick={() => router.push("/auth/login")}
                  style={{
                    color: "gray",
                  }}
                >
                  <PersonAddRoundedIcon
                    style={{ color: "lightgray", marginRight: 11 }}
                  />
                  Log In
                  <KeyboardArrowRightRoundedIcon
                    style={{
                      marginRight: 7,
                      color: "gray",
                      marginLeft: "auto",
                    }}
                    fontSize="small"
                  />
                </div>
              )}
            </div>
            <div
              className={headerStyles.menu_overlay}
              id="overlay"
              onClick={() => setShowMenu(false)}
              onScroll={() => setShowMenu(false)}
              onTouchMove={() => setShowMenu(false)}
              onTouchStart={() => setShowMenu(false)}
            ></div>
          </div>
        )}

        <div className={headerStyles.mobile_top}>
          <div className={headerStyles.left}>
            {!forAuth && (
              <IconButton onClick={() => setShowMenu(true)}>
                <MenuIcon style={{ color: "white" }} />
              </IconButton>
            )}
            <Link href="/">
              <a>
                <img
                  src="/assets/icon.png"
                  className={headerStyles.header__logo}
                  style={{ marginLeft: 0 }}
                  alt=""
                />
              </a>
            </Link>
          </div>

          {forAuth ? (
            <Link href="/">
              <a
                className={headerStyles.checkoutLink}
                style={{ marginRight: 4 }}
              >
                <div className={headerStyles.header__optionBasket}>
                  <HomeRoundedIcon />
                </div>
              </a>
            </Link>
          ) : (
            <div className={headerStyles.header__nav}>
              {user ? (
                <Link href="/checkout">
                  <a className={headerStyles.checkoutLink}>
                    <div className={headerStyles.header__optionBasket}>
                      <ShoppingCartRoundedIcon />
                      <span
                        className={[
                          headerStyles.header__optionLineTwo,
                          headerStyles.header__basketCount,
                        ]}
                      >
                        {basket?.length}
                      </span>
                    </div>
                  </a>
                </Link>
              ) : (
                <div
                  className={headerStyles.header__optionBasket}
                  onClick={() =>
                    confirm(
                      "You must Login first in order to access your Basket"
                    )
                      ? router.push("/auth/login")
                      : null
                  }
                >
                  <ShoppingCartRoundedIcon />
                </div>
              )}
            </div>
          )}
        </div>

        {!forPayments && (
          <div className={headerStyles.header__search}>
            <Autocomplete
              freeSolo
              onChange={(e, v) => {
                if (v && v.trim().length > 0) {
                  router.push(`/search/${v}`);
                  setSearchString("");
                }
              }}
              inputValue={searchString}
              onInputChange={(e, v) => setSearchString(v)}
              className={headerStyles.header__autocomplete}
              id="custom-input-demo"
              options={[...products, searchString]}
              renderInput={(params) => (
                <div
                  ref={params.InputProps.ref}
                  className={headerStyles.header__autocompleteDiv}
                >
                  <input
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      height: "100%",
                      fontSize: 16,
                      padding: 7,
                      paddingLeft: 11,
                      paddingRight: 11,
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                    }}
                    placeholder="Search for a Product"
                    className={headerStyles.header__searchInput}
                    type="text"
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        searchString.trim().length > 0
                      ) {
                        router.push(`/search/${searchString}`);
                      }
                    }}
                    {...params.inputProps}
                  />
                </div>
              )}
            />
            <IconButton
              className={headerStyles.searchButton}
              onClick={() =>
                searchString.trim().length > 0 &&
                router.push(`/search/${searchString}`)
              }
            >
              <SearchIcon className={headerStyles.header__searchIcon} />
            </IconButton>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
