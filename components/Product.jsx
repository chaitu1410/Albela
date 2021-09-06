import productStyles from "../styles/components/Product.module.css";
import React, { useEffect, useState } from "react";
import { useStateValue } from "../context/StateProvider";
import Link from "next/link";
import { db } from "../services/firebase";
import { CircularProgress } from "@material-ui/core";

const Product = ({
  id,
  name,
  preview,
  price,
  by,
  setOpen,
  discount,
  unavailable,
}) => {
  const [{}, dispatch] = useStateValue();
  const [image, setImage] = useState("");
  const [seller, setSeller] = useState({});

  // const addToBasket = () => {
  //   dispatch({
  //     type: "ADD_TO_BASKET",
  //     item: {
  //       id: id,
  //       name: name,
  //       image: image,
  //       price: price,
  //       rating: rating,
  //     },
  //   });
  // };
  // const removeFromBasket = () => {
  //   dispatch({
  //     type: "REMOVE_FROM_BASKET",
  //     id: id,
  //   });
  // };

  useEffect(() => {
    for (const image of preview) {
      if (image.type.includes("image")) {
        setImage(image.url);
        break;
      }
    }
  }, []);

  useEffect(() => {
    db.collection("Sellers")
      .doc(by)
      .get()
      .then((snapshot) =>
        setSeller({
          isVIP: snapshot.data().isVIP,
          rechargeValidity: snapshot.data().rechargeValidity,
        })
      );
  }, [by]);

  return Object.keys(seller).length ? (
    <div className={productStyles.product}>
      {(unavailable ||
        (!seller?.isVIP &&
          seller?.rechargeValidity < new Date().getTime())) && (
        <div className="mask" onClick={() => setOpen(true)}>
          <p className="mask-text">Unavailable</p>
        </div>
      )}
      <Link href={`/product/${id}`}>
        <a className={productStyles.product_link}>
          {discount && <p className="off">{discount}%</p>}
          <div className={productStyles.product__image}>
            <img src={image} alt="" className={productStyles.image} />
          </div>
          <div className={productStyles.product__info}>
            <p className={productStyles.product__title}>{name}</p>
            <p className={productStyles.product__price}>
              <strong style={{ marginRight: 7 }}>
                ₹
                {discount && discount !== "0"
                  ? (
                      Number(price) -
                      (Number(price) * Number(discount)) / 100
                    ).toFixed(0)
                  : price}
              </strong>
              {discount && discount !== "0" && (
                <small className="strike">₹{price}</small>
              )}
            </p>
          </div>
        </a>
      </Link>
      {/* {basket?.filter((item) => item.id === id).length ? (
        <div className="counters">
          <IconButton onClick={removeFromBasket} className="counter_buttons">
            <RemoveRoundedIcon />
          </IconButton>
          <p className="itemCount">
            {basket?.filter((item) => item.id === id).length}
          </p>
          <IconButton onClick={addToBasket} className="counter_buttons">
            <AddRoundedIcon />
          </IconButton>
        </div>
      ) : (
        <button onClick={addToBasket}>Add to Basket</button>
      )} */}
    </div>
  ) : (
    <div
      className={productStyles.product}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  );
};

export default Product;

{
  /* <div className={productStyles.product__rating}>
          {Array(rating)
            .fill()
            .map((_, i) => (
              <p>⭐</p>
            ))}
        </div> */
}
