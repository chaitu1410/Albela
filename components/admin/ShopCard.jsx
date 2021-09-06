import React from "react";
import Link from "next/link";
import shopCardStyles from "../../styles/components/admin/ShopCard.module.css";

const ShopCard = ({ seller }) => {
  return (
    <Link href={`/albela-admin/seller-shops/${seller.id}`}>
      <a className={shopCardStyles.shopCard}>
        <p className={shopCardStyles.name}>{seller.shopName}</p>
        <p className={shopCardStyles.status}>
          {seller.isVIP
            ? "🌟"
            : seller.rechargeValidity > new Date().getTime()
            ? "🟢"
            : "🔴"}
        </p>
      </a>
    </Link>
  );
};

export default ShopCard;
