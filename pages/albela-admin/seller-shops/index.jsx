import { CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import AdminHeader from "../../../components/admin/AdminHeader";
import ShopCard from "../../../components/admin/ShopCard";
import { useStateValue } from "../../../context/StateProvider";
import { db } from "../../../services/firebase";
import sellerShopStyles from "../../../styles/pages/admin/SellerShopHome.module.css";
import Head from "next/head";

export const getStaticProps = async () => {
  const sellerSnapshot = await db
    .collection("Sellers")
    .orderBy("shopName")
    .get();
  const sellers = sellerSnapshot.docs.map((doc) => ({
    id: doc.id,
    email: doc.data().email,
    isVIP: doc.data().isVIP,
    name: doc.data().name,
    phno: doc.data().phno,
    rechargeValidity: doc.data().rechargeValidity,
    shopAddress: doc.data().shopAddress,
    shopName: doc.data().shopName,
    shopCity: doc.data().shopCity,
  }));

  return {
    props: {
      sellers,
    },
    revalidate: 1,
  };
};

const SellerShops = ({ sellers }) => {
  const [searchString, setSearchString] = useState("");
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);
  const [{ isAdminValidated }, dispatch] = useStateValue();

  useEffect(() => {
    if (isAdminValidated) {
      setShowLoading(false);
    } else {
      router.replace("/albela-admin");
    }
  }, [isAdminValidated]);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div className={sellerShopStyles.sellerShop}>
      <Head>
        <title>Albela (Admin) | Shops</title>
      </Head>
      <AdminHeader
        forShopListPage
        searchString={searchString}
        setSearchString={setSearchString}
      />
      <div className={sellerShopStyles.shops}>
        {sellers
          ?.filter(
            (seller) =>
              seller.name
                .toLowerCase()
                .includes(searchString.trim().toLowerCase()) ||
              seller.shopName
                .toLowerCase()
                .includes(searchString.trim().toLowerCase())
          )
          .map((seller) => (
            <ShopCard seller={seller} />
          ))}
      </div>
    </div>
  );
};

export default SellerShops;
