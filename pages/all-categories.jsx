import { CircularProgress } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import allCategoryStyles from "../styles/pages/AllCategory.module.css";
import Header from "../components/Header";
import AddRoundedIcon from "@material-ui/icons/AddRounded";
import Link from "next/link";
import Head from "next/head";
import { useStateValue } from "../context/StateProvider";

export const getStaticProps = async () => {
  const categoriesSnapshot = await db
    .collection("Categories")
    .orderBy("category")
    .get();
  const categories = categoriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    category: doc.data().category,
  }));

  return {
    props: {
      categories,
    },
    revalidate: 1,
  };
};

const AllCategory = ({ categories }) => {
  const [{ user }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);
  const [category, setCategory] = useState("");

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
    <div className={allCategoryStyles.addCategory}>
      <Head>
        <title>Albela | All Categories</title>
      </Head>
      <Header />
      <div className={allCategoryStyles.container}>
        <input
          className={allCategoryStyles.inputs}
          type="text"
          name="category"
          id="category"
          placeholder="Search for Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        {categories
          ?.filter((allCategory) =>
            allCategory.category.toLowerCase().includes(category.toLowerCase())
          )
          .map((category) => (
            <Link href={`/category/${category.id}`} key={category.id}>
              <a className={allCategoryStyles.categoryCard}>
                <p className={allCategoryStyles.categoryName}>
                  {category.category}
                </p>
                <AddRoundedIcon
                  fontSize="small"
                  style={{
                    background: "gray",
                    color: "white",
                    borderRadius: 3,
                  }}
                />
              </a>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default AllCategory;
