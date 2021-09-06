import { CircularProgress } from "@material-ui/core";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import categoryProductStyles from "../../styles/components/CategoryProduct.module.css";

const CategoryProduct = ({ id, name, preview, price, discount, by }) => {
  const [image, setImage] = useState("");

  useEffect(() => {
    for (const image of preview) {
      if (image.type.includes("image")) {
        setImage(image.url);
        break;
      }
    }
  }, []);

  return (
    <div className={categoryProductStyles.product}>
      <Link href={`/albela-admin/seller-shops/product/${id}`}>
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
  );
};

export default CategoryProduct;
