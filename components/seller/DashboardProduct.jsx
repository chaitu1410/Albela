import React, { useEffect, useState } from "react";
import EditRoundedIcon from "@material-ui/icons/EditRounded";
import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded";
import { IconButton } from "@material-ui/core";
import dashboardProductStyles from "../../styles/components/seller/DashboardProduct.module.css";
import { db, storage } from "../../services/firebase";
import router from "next/router";
import { useStateValue } from "../../context/StateProvider";

const DashboardProduct = ({
  id,
  preview,
  name,
  categoryID,
  price,
  discount,
  setOpen,
}) => {
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [{}, dispatch] = useStateValue();

  useEffect(() => {
    for (const image of preview) {
      if (image.type.includes("image")) {
        setImage(image.url);
        break;
      }
    }

    db.collection("Categories")
      .doc(categoryID)
      .get()
      .then((snapshot) => setCategory(`(${snapshot.data().category})`));
  }, []);

  const deleteProduct = async () => {
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

  return (
    <div className={dashboardProductStyles.product}>
      <a className={dashboardProductStyles.product_link}>
        <div className={dashboardProductStyles.product__image}>
          <img src={image} alt="" className={dashboardProductStyles.image} />
        </div>
        <div className={dashboardProductStyles.product__info}>
          <p className={dashboardProductStyles.product__title}>{name}</p>
          <p className={dashboardProductStyles.product__category}>{category}</p>
          <p className={dashboardProductStyles.product__price}>
            <span>
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
            </span>
            <span>
              <IconButton
                className={dashboardProductStyles.icon_button}
                onClick={() => {
                  dispatch({
                    type: "SET_PRODUCT",
                    product: id,
                  });
                  router.push("/seller/edit-product");
                }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton
                className={dashboardProductStyles.icon_button}
                onClick={deleteProduct}
              >
                <DeleteRoundedIcon
                  fontSize="small"
                  style={{ color: "tomato" }}
                />
              </IconButton>
            </span>
          </p>
        </div>
      </a>
    </div>
  );
};

export default DashboardProduct;
