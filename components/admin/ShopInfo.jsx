import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import ExpandMoreRoundedIcon from "@material-ui/icons/ExpandMoreRounded";
import shopInfoStyles from "../../styles/components/admin/ShopInfo.module.css";
import productDetailsStyles from "../../styles/pages/ProductDetails.module.css";
import ExpandLessRoundedIcon from "@material-ui/icons/ExpandLessRounded";
import { IconButton } from "@material-ui/core";

const ShopInfo = ({ sellerID }) => {
  const [seller, setSeller] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    db.collection("Sellers")
      .doc(sellerID)
      .get()
      .then((data) =>
        setSeller({
          id: data.id,
          email: data.data().email,
          isVIP: data.data().isVIP,
          name: data.data().name,
          phno: data.data().phno,
          rechargeValidity: data.data().rechargeValidity,
          shopAddress: data.data().shopAddress,
          shopName: data.data().shopName,
          shopCity: data.data().shopCity,
        })
      );
  }, []);

  //   useEffect(
  //     () =>
  //       (document.querySelector("#seller-info").style.height = open
  //         ? "auto"
  //         : "0px"),
  //     [open]
  //   );

  return (
    <div className={shopInfoStyles.shopInfo}>
      <h3 style={{ marginBottom: 0 }}>
        {seller.shopName}
        <IconButton onClick={() => setOpen(!open)}>
          {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
        </IconButton>
      </h3>
      {open && (
        <div
          className={productDetailsStyles.product_details}
          style={{ marginTop: 0, overflow: "hidden" }}
        >
          <table>
            <tbody>
              <tr
                className={productDetailsStyles.table_row}
                className={productDetailsStyles.table_row}
              >
                <td>Seller Name</td>
                <td className={productDetailsStyles.value}>{seller.name}</td>
              </tr>
              <tr
                className={productDetailsStyles.table_row}
                className={productDetailsStyles.table_row}
              >
                <td>Seller Email</td>
                <td className={productDetailsStyles.value}>{seller.email}</td>
              </tr>
              <tr
                className={productDetailsStyles.table_row}
                className={productDetailsStyles.table_row}
              >
                <td>Seller Email</td>
                <td className={productDetailsStyles.value}>{seller.email}</td>
              </tr>
              <tr
                className={productDetailsStyles.table_row}
                className={productDetailsStyles.table_row}
              >
                <td>Seller Ph. no.</td>
                <td className={productDetailsStyles.value}>{seller.phno}</td>
              </tr>
              <tr
                className={productDetailsStyles.table_row}
                className={productDetailsStyles.table_row}
              >
                <td>Shop Address</td>
                <td className={productDetailsStyles.value}>
                  {seller.shopAddress}
                </td>
              </tr>
              <tr
                className={productDetailsStyles.table_row}
                className={productDetailsStyles.table_row}
              >
                <td>Validity</td>
                <td className={productDetailsStyles.value}>
                  {new Date(seller.rechargeValidity).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShopInfo;
