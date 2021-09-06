import Head from "next/head";
import Header from "../components/Header";
import HomePage from "../components/HomePage";
import { useStateValue } from "../context/StateProvider";
import CategoriesBar from "../components/CategoriesBar";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { CircularProgress, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

export const getStaticProps = async () => {
  const categoriesSnapshot = await db.collection("Categories").get();
  const categories = categoriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    category: doc.data().category,
  }));

  const productSnapshot = await db.collection("Products").get();
  const products = productSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    preview: doc.data().preview,
    categoryID: doc.data().category,
    price: doc.data().price,
    discount: doc.data().discount,
    unavailable: doc.data().unavailable || null,
    details: doc.data().details,
    by: doc.data().by,
  }));

  const adSnapshot = await db.collection("Ads").get();
  const ads = adSnapshot.docs.map((doc) => ({
    id: doc.id,
    ad: doc.data().ad,
  }));

  return {
    props: {
      categories,
      products,
      ads,
    },
    revalidate: 1,
  };
};

export default function Home({ categories, products, ads }) {
  const [{ user }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);
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
              setShowLoading(false);
            } else {
              setShowLoading(false);
            }
          });
      } else {
        setShowLoading(false);
      }
    } else {
      setShowLoading(false);
    }
  }, []);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div>
      <Snackbar open={open} autoHideDuration={1111} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info">
          This product is unavailable!
        </Alert>
      </Snackbar>
      <Head>
        <title>Albela | Home</title>
      </Head>
      <Header />
      <CategoriesBar />
      <HomePage
        setOpen={setOpen}
        categories={categories}
        products={products}
        ads={ads}
      />
    </div>
  );
}
