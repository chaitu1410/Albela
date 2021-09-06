import React, { useEffect, useState } from "react";
import Link from "next/link";
import productStyles from "../../styles/components/Product.module.css";
import dashboardProductStyles from "../../styles/components/seller/DashboardProduct.module.css";
import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded";
import { IconButton } from "@material-ui/core";
import { db, storage } from "../../services/firebase";
import { useRouter } from "next/router";

const AdminProduct = ({
  id,
  name,
  preview,
  price,
  sellerID,
  setOpen,
  discount,
}) => {
  const [image, setImage] = useState("");
  const router = useRouter();

  const deleteProduct = async (e) => {
    e.preventDefault();
    if (
      confirm(
        "Are you sure you want to delete this product?\n(Click 'OK' and the product will be deleted ASAP!)"
      )
    ) {
      for (const image of preview) {
        await storage.refFromURL(image.url).delete();
      }
      for (const orderDoc of (
        await db.collection("Orders").where("product", "==", id).get()
      ).docs) {
        await db.collection("Orders").doc(orderDoc.id).delete();
      }
      await db.collection("Products").doc(id).delete();
      setOpen(true);
    }
  };

  useEffect(() => {
    for (const image of preview) {
      if (image.type.includes("image")) {
        setImage(image.url);
        break;
      }
    }
    var $ = jQuery.noConflict();
    $("a .product__info .bottom_container .icon_button").on(
      "click",
      function () {
        return false;
      }
    );
  }, []);

  return (
    <div className={productStyles.product}>
      <Link href={`/albela-admin/seller-shops/product/${id}`}>
        <a className={productStyles.product_link}>
          {discount && <p className="off">{discount}%</p>}
          <div className={productStyles.product__image}>
            <img src={image} alt="" className={productStyles.image} />
          </div>
          <div className={productStyles.product__info}>
            <p className={productStyles.product__title}>{name}</p>
            <div className={productStyles.bottom_container}>
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

              <IconButton
                className={dashboardProductStyles.icon_button}
                onClick={deleteProduct}
              >
                <DeleteRoundedIcon
                  fontSize="small"
                  style={{ color: "tomato" }}
                />
              </IconButton>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
};

export default AdminProduct;
