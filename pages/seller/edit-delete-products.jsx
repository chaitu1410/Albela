import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DashboardHeader from "../../components/seller/DashboardHeader";
import DashboardProduct from "../../components/seller/DashboardProduct";
import { db } from "../../services/firebase";
import editDeleteStyles from "../../styles/pages/seller/EditDeleteProducts.module.css";
import { useStateValue } from "../../context/StateProvider";
import { CircularProgress, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Head from "next/head";

const EditDeleteProducts = () => {
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);
  const [{ user }, dispatch] = useStateValue();
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    if (!user) {
      const userID = localStorage.getItem("albelaUserID");

      if (userID) {
        db.collection("Users")
          .doc(userID)
          .get()
          .then((data) => {
            if (data.exists) {
              dispatch({
                type: "SET_USER",
                user: {
                  id: data.id,
                  name: data.data().name,
                  phno: data.data().phno,
                  password: data.data().password,
                  isSeller: data.data().isSeller,
                  address: data.data().address,
                  sellerID: data.data().sellerID,
                },
              });
              dispatch({
                type: "SET_BASKET",
                basket: data.data().basket,
              });
              if (!data.data().isSeller) {
                router.replace("/seller/register");
              }
            } else {
              setShowLoading(false);
              router.replace("/auth/login");
            }
          });
      } else {
        router.replace("/auth/login");
      }
    } else {
      if (!user.isSeller) {
        router.replace("/seller/register");
      }
    }
  }, []);

  useEffect(() => {
    let snapshot;
    if (user) {
      snapshot = db
        .collection("Products")
        .where("by", "==", user?.sellerID)
        .onSnapshot((snapshot) => {
          setProducts(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().name,
              preview: doc.data().preview,
              categoryID: doc.data().category,
              price: doc.data().price,
              discount: doc.data().discount,
              details: doc.data().details,
              by: doc.data().by,
            }))
          );
          setShowLoading(false);
        });
    }

    return () => {
      if (user) {
        snapshot();
      }
    };
  }, [user]);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div className={editDeleteStyles.container}>
      <Head>
        <title>Albela (Seller) | Edit-Delete Products</title>
      </Head>
      <DashboardHeader />
      <Snackbar open={open} autoHideDuration={1111} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning">
          Product Deleted!
        </Alert>
      </Snackbar>
      <div className={editDeleteStyles.products}>
        {products.map((product) => (
          <DashboardProduct
            key={product?.id}
            id={product?.id}
            preview={product?.preview}
            name={product?.name}
            categoryID={product?.categoryID}
            price={product?.price}
            discount={product?.discount}
            setOpen={setOpen}
          />
        ))}
      </div>
    </div>
  );
};

export default EditDeleteProducts;
