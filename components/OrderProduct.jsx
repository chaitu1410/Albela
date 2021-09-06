import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useStateValue } from "../context/StateProvider";
import { db } from "../services/firebase";
import orderProductStyles from "../styles/components/OrderProduct.module.css";

const OrderProduct = ({
  id,
  productID,
  paymentMethod,
  quantity,
  price,
  address,
  status,
  timestamp,
  usingFor,
  name,
  phno,
}) => {
  const [image, setImage] = useState("");
  const [{}, dispatch] = useStateValue();
  const [seller, setSeller] = useState({});
  const [productName, setProductName] = useState("");

  useEffect(() => {
    db.collection("Products")
      .doc(productID)
      .get()
      .then((data) => {
        setProductName(data.data().name);
        db.collection("Sellers")
          .doc(data.data().by)
          .get()
          .then((snapshot) => {
            setSeller({
              sellerName: snapshot.data().name,
              shopName: snapshot.data().shopName,
              phno: snapshot.data().phno,
            });
            for (const image of data.data().preview) {
              if (image.type.includes("image")) {
                setImage(image.url);
                break;
              }
            }
          });
      });
    var $ = jQuery.noConflict();
    $(`.${orderProductStyles.order_options}`).on("click", function () {
      return false;
    });
  }, [productID]);

  return (
    <div
      className={orderProductStyles.product}
      style={{
        background:
          status === "Delivered"
            ? "rgba(0, 255, 0, 0.4)"
            : status === "Shipped"
            ? "rgba(255, 255, 0, 0.4)"
            : status === "Cancelled" || status === "Cancelled by Seller"
            ? "rgba(0, 0, 0, 0.15)"
            : "white",
      }}
    >
      <Link href={`/product/${productID}`}>
        <a className={orderProductStyles.product_link}>
          <div className={orderProductStyles.product__image}>
            <img src={image} alt="" className={orderProductStyles.image} />
          </div>
          <div className={orderProductStyles.product__info}>
            <p className={orderProductStyles.product__title}>{productName}</p>
            <p className={orderProductStyles.product__price}>
              <small>₹</small>
              <strong>{price}</strong>
            </p>
            <p className={orderProductStyles.order_info}>
              Quantity: {quantity}
            </p>
            <p className={orderProductStyles.order_info}>
              Payment: {paymentMethod}
            </p>
            <p className={orderProductStyles.order_info}>
              Ordered on: {timestamp.toDate().toLocaleString()}
            </p>
            {usingFor === "admin" || usingFor === "seller" ? (
              <>
                <p className={orderProductStyles.order_info}>
                  Customer Name: {name}
                </p>
                <p className={orderProductStyles.order_info}>
                  Customer Phno: {phno}
                </p>
              </>
            ) : (
              <></>
            )}
            <p className={orderProductStyles.order_info}>
              Destination: {address}
            </p>
            {usingFor !== "seller" ? (
              <>
                <p className={orderProductStyles.order_info}>
                  Seller Shop: {seller.shopName}
                </p>
                <p className={orderProductStyles.order_info}>
                  Seller Name: {seller.sellerName}
                </p>
                <p className={orderProductStyles.order_info}>
                  Seller Phno: {seller.phno}
                </p>
              </>
            ) : (
              <></>
            )}
            {usingFor === "seller" ? (
              status !== "Cancelled" ? (
                <>
                  <label className={orderProductStyles.order_info}>
                    Status:{" "}
                  </label>
                  <select
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={
                      status === "Cancelled by Seller" || status === "Cancelled"
                        ? orderProductStyles.cancel_button
                        : orderProductStyles.order_options
                    }
                    style={{ marginLeft: 4 }}
                    name="status"
                    id="status"
                    value={status}
                    onChange={(e) => {
                      // if (
                      //   status !== "Cancelled by Seller" &&
                      //   status !== "Cancelled"
                      // ) {
                      // if (e.target.value === "Cancelled by Seller") {
                      //   if (
                      //     confirm(
                      //       "Are you sure to Cancel this Order?\n(Once cancelled, you cannot revert this process)"
                      //     )
                      //   ) {
                      //     db.collection("Orders")
                      //       .doc(id)
                      //       .update({ status: e.target.value });
                      //   }
                      // } else {
                      db.collection("Orders")
                        .doc(id)
                        .update({ status: e.target.value });
                      // }
                      // }
                    }}
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option
                      value="Cancelled by Seller"
                      style={{ background: "#b12704", color: "white" }}
                    >
                      {status === "Cancelled by Seller" ||
                      status === "Cancelled"
                        ? "Order Cancelled"
                        : "Cancel Order"}
                    </option>
                  </select>
                </>
              ) : (
                <p className={orderProductStyles.order_info}>
                  Status:{" "}
                  <span
                    style={{ fontWeight: 600 }}
                  >{`${status} by Customer`}</span>
                </p>
              )
            ) : (
              <p className={orderProductStyles.order_info}>
                Status: <span style={{ fontWeight: 600 }}>{status}</span>
              </p>
            )}
            {usingFor !== "admin" &&
              usingFor !== "seller" &&
              status !== "Delivered" &&
              status !== "Cancelled" &&
              status !== "Cancelled by Seller" && (
                <div
                  className={orderProductStyles.cancel_button}
                  style={{
                    width: "fit-content",
                    marginTop: 4,
                    paddingBottom: 2,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (
                      confirm(
                        "Are you sure to cancel this order?\n(Once cancelled, you cannot revert this process)"
                      )
                    ) {
                      db.collection("Orders")
                        .doc(id)
                        .update({ status: "Cancelled" });
                    }
                  }}
                >
                  Cancel Order
                </div>
              )}
            {/* <FormControl variant="filled" className={classes.formControl}>
              <Select
                native
                onChange={(e) => console.log(e.target.value)}
                inputProps={{
                  name: "age",
                  id: "filled-age-native-simple",
                }}
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </Select>
            </FormControl> */}
          </div>
        </a>
      </Link>
    </div>
  );
};

export default OrderProduct;
