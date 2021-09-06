import React, { useEffect, useState } from "react";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminProduct from "../../../components/admin/AdminProduct";
import { db } from "../../../services/firebase";
import homeStyles from "../../../styles/components/Home.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { CircularProgress, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AdminTop from "../../../components/admin/AdminTop";
import ShopInfo from "../../../components/admin/ShopInfo";
import { useStateValue } from "../../../context/StateProvider";
import Head from "next/head";

export const getStaticPaths = async () => {
  const snapshot = await db.collection("Sellers").get();
  const paths = snapshot.docs.map((doc) => ({
    params: {
      sellerID: doc.id.toString(),
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const categoriesSnapshot = await db.collection("Categories").get();
  const categories = categoriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    category: doc.data().category,
  }));

  const productSnapshot = await db
    .collection("Products")
    .where("by", "==", params.sellerID)
    .get();
  const products = productSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    preview: doc.data().preview,
    categoryID: doc.data().category,
    price: doc.data().price,
    discount: doc.data().discount,
    details: doc.data().details,
    by: doc.data().by,
  }));

  return {
    props: {
      categories,
      products,
    },
    revalidate: 1,
  };
};

const SellerShop = () => {
  const router = useRouter();
  const { sellerID } = router.query;
  const [open, setOpen] = useState(false);
  const [{ isAdminValidated }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    dispatch({
      type: "SET_SELLER",
      seller: sellerID,
    });
  }, []);

  useEffect(() => {
    if (isAdminValidated) {
      setShowLoading(false);
    } else {
      router.replace("/albela-admin");
    }
  }, [isAdminValidated]);

  useEffect(() => {
    db.collection("Categories").onSnapshot((categoriesSnapshot) =>
      setCategories(
        categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          category: doc.data().category,
        }))
      )
    );

    db.collection("Products")
      .where("by", "==", sellerID)
      .onSnapshot((productSnapshot) =>
        setProducts(
          productSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            preview: doc.data().preview,
            categoryID: doc.data().category,
            price: doc.data().price,
            discount: doc.data().discount,
            details: doc.data().details,
            by: doc.data().by,
          }))
        )
      );
  }, []);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div>
      <Head>
        <title>Albela (Admin) | Shop/Seller Details</title>
      </Head>
      <AdminHeader />
      <AdminTop sellerID={sellerID} />
      <ShopInfo sellerID={sellerID} />
      <Snackbar open={open} autoHideDuration={2121} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning">
          Product Deleted!
        </Alert>
      </Snackbar>
      {categories?.map((category) =>
        products?.filter((product) => product.categoryID === category.id)
          .length ? (
          <div className={homeStyles.productShowcase}>
            <h3>{category.category}</h3>
            <div className={homeStyles.product__row}>
              {products
                ?.filter((product) => product.categoryID === category.id)
                .slice(0, 4)
                .map((product) => (
                  <AdminProduct
                    setOpen={setOpen}
                    key={product?.id}
                    id={product?.id}
                    sellerID={sellerID}
                    preview={product?.preview}
                    name={product?.name}
                    price={product?.price}
                    by={product?.by}
                    discount={product?.discount}
                  />
                ))}
            </div>
            <Link href={`/albela-admin/seller-shops/category/${category.id}`}>
              <a className={homeStyles.seeMore}>See more and manage</a>
            </Link>
          </div>
        ) : (
          <></>
        )
      )}
    </div>
  );
};

export default SellerShop;
