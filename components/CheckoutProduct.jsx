import React, { useEffect, useState } from "react";
import checkoutProductStyles from "../styles/components/CheckoutProduct.module.css";
import { useStateValue } from "../context/StateProvider";
import { CircularProgress, IconButton } from "@material-ui/core";
import AddRoundedIcon from "@material-ui/icons/AddRounded";
import Link from "next/link";
import RemoveRoundedIcon from "@material-ui/icons/RemoveRounded";
import { db } from "../services/firebase";

const CheckoutProduct = ({
  id,
  hideButton,
  setOpen,
  setOpenAdded,
  setOpenRemoved,
}) => {
  const [{ basket, user }, dispatch] = useStateValue();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState("");
  const [seller, setSeller] = useState({});

  const addToBasket = () => {
    dispatch({
      type: "ADD_TO_BASKET",
      id: id,
    });
    dispatch({
      type: "SET_PRICE",
      price:
        product?.discount && product?.discount !== "0"
          ? (
              Number(product?.price) -
              (Number(product?.price) * Number(product?.discount)) / 100
            ).toFixed(0)
          : product.price,
    });
    setOpen(false);
    setOpenRemoved(false);
    setOpenAdded(true);
  };
  const removeFromBasket = () => {
    dispatch({
      type: "REMOVE_FROM_BASKET",
      id: id,
    });
    dispatch({
      type: "SET_PRICE",
      price: `${-(product?.discount && product?.discount !== "0"
        ? (
            Number(product?.price) -
            (Number(product?.price) * Number(product?.discount)) / 100
          ).toFixed(0)
        : product.price)}`,
    });
    setOpen(false);
    setOpenAdded(false);
    setOpenRemoved(true);
  };
  const removeAll = () => {
    dispatch({
      type: "REMOVE_ALL_FROM_BASKET",
      id: id,
    });
    dispatch({
      type: "SET_PRICE",
      price: `${-(product?.discount && product?.discount !== "0"
        ? basket.filter((itemID) => itemID === id).length *
          (
            Number(product?.price) -
            (Number(product?.price) * Number(product?.discount)) / 100
          ).toFixed(0)
        : basket.filter((itemID) => itemID === id).length *
          Number(product.price))}`,
    });
    setOpen(false);
    setOpenAdded(false);
    setOpenRemoved(true);
  };

  useEffect(() => {
    db.collection("Products")
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setProduct({
            name: doc.data().name,
            preview: doc.data().preview,
            price: doc.data().price,
            discount: doc.data().discount,
            unavailable: doc.data().unavailable,
            by: doc.data().by,
          });
          db.collection("Sellers")
            .doc(doc.data().by)
            .get()
            .then((snapshot) => {
              setSeller({
                isVIP: snapshot.data().isVIP,
                rechargeValidity: snapshot.data().rechargeValidity,
              });
              if (
                snapshot.data().isVIP ||
                snapshot.data().rechargeValidity >= new Date().getTime()
              ) {
                dispatch({
                  type: "SET_PRICE",
                  price: `${
                    doc.data().discount && doc.data().discount !== "0"
                      ? basket.filter((itemID) => itemID === id).length *
                        (
                          Number(doc.data().price) -
                          (Number(doc.data().price) *
                            Number(doc.data().discount)) /
                            100
                        ).toFixed(0)
                      : basket.filter((itemID) => itemID === id).length *
                        Number(doc.data().price)
                  }`,
                });
              }
            });
        } else {
          db.collection("Users")
            .doc(user?.id)
            .update({ basket: basket?.filter((item) => item !== doc.id) });
        }
      });
  }, []);

  useEffect(() => {
    if (product.preview) {
      for (const image of product.preview) {
        if (image.type.includes("image")) {
          setImage(image.url);
          break;
        }
      }
    }
  }, [product]);

  // useEffect(() => {
  //   if (product && product?.by) {
  //     db.collection("Sellers")
  //       .doc(product?.by)
  //       .onSnapshot((snapshot) =>
  //         setSeller({
  //           isVIP: snapshot.data().isVIP,
  //           rechargeValidity: snapshot.data().rechargeValidity,
  //         })
  //       );
  //   }
  // }, [product]);

  return Object.keys(seller).length ? (
    <div className={checkoutProductStyles.checkoutProduct}>
      {(product?.unavailable ||
        (!seller?.isVIP &&
          seller?.rechargeValidity < new Date().getTime())) && (
        <div
          className="mask"
          onClick={() => {
            setOpenAdded(false);
            setOpenRemoved(false);
            setOpen(true);
          }}
        >
          <p className="mask-text">Unavailable</p>
        </div>
      )}
      <Link href={`/product/${id}`}>
        <a
          className="product_link"
          style={{
            flexDirection: "column",
            height: "fit-content",
          }}
        >
          {/* {product?.discount && <p className="off">{product?.discount}%</p>} */}
          <div
            className={checkoutProductStyles.image}
            style={{
              width: "100%",
              height: 151,
            }}
          >
            <img
              src={image}
              className={checkoutProductStyles.checkoutProduct__image}
            />
          </div>
          <div className={checkoutProductStyles.checkoutProduct__info}>
            <p className={checkoutProductStyles.checkoutProduct__title}>
              {product.name}
            </p>
            <p className={checkoutProductStyles.checkoutProduct__price}>
              <strong style={{ marginRight: 4 }}>
                ₹
                {product?.discount && product?.discount !== "0"
                  ? (
                      Number(product?.price) -
                      (Number(product?.price) * Number(product?.discount)) / 100
                    ).toFixed(0)
                  : product.price}
              </strong>
              {product?.discount && product?.discount !== "0" && (
                <small className="strike">₹{product.price}</small>
              )}
            </p>
            {product?.discount && (
              <p className={checkoutProductStyles.off}>
                ({product?.discount}%)
              </p>
            )}
          </div>
        </a>
      </Link>
      <div className={checkoutProductStyles.buttons}>
        <div
          style={{
            border: "1px solid lightgray",
            borderRadius: 5,
            width: "fit-content",
            marginRight: 4,
            justifyContent: "flex-start",
          }}
          className={`counters ${checkoutProductStyles.counter__mobile}`}
        >
          <IconButton
            style={{ padding: 5 }}
            onClick={removeFromBasket}
            className="counter_buttons"
          >
            <RemoveRoundedIcon fontSize="small" />
          </IconButton>
          <p className="itemCount">
            {basket.filter((itemID) => itemID === id).length}
          </p>
          <IconButton
            style={{ padding: 5 }}
            onClick={addToBasket}
            className="counter_buttons"
          >
            <AddRoundedIcon fontSize="small" />
          </IconButton>
        </div>
        {!hideButton && (
          <button
            className={checkoutProductStyles.remove_button}
            onClick={removeAll}
          >
            Remove All
          </button>
        )}
      </div>
    </div>
  ) : (
    <div
      className={checkoutProductStyles.checkoutProduct}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 21,
        paddingBottom: 21,
      }}
    >
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  );
};

export default CheckoutProduct;
