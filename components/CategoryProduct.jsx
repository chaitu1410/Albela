import { CircularProgress, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useStateValue } from "../context/StateProvider";
import { db } from "../services/firebase";
import categoryProductStyles from "../styles/components/CategoryProduct.module.css";

const CategoryProduct = ({
  id,
  name,
  preview,
  price,
  discount,
  unavailable,
  by,
  setOpen,
}) => {
  const [image, setImage] = useState("");
  const [{}, dispatch] = useStateValue();
  const [seller, setSeller] = useState({});

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
    <div className={categoryProductStyles.product}>
      {(unavailable ||
        (!seller?.isVIP &&
          seller?.rechargeValidity < new Date().getTime())) && (
        <div className="mask" onClick={() => setOpen(true)}>
          <p className="mask-text">Unavailable</p>
        </div>
      )}
      <Link href={`/product/${id}`}>
        <a className={categoryProductStyles.product_link}>
          <div className={categoryProductStyles.product__image}>
            <img src={image} alt="" className={categoryProductStyles.image} />
          </div>
          <div className={categoryProductStyles.product__info}>
            <p className={categoryProductStyles.product__title}>{name}</p>
            <p className={categoryProductStyles.product__price}>
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
            {discount && (
              <p className={categoryProductStyles.off}>({discount}%)</p>
            )}
          </div>
        </a>
      </Link>
    </div>
  ) : (
    <div
      className={categoryProductStyles.product}
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

export default CategoryProduct;
