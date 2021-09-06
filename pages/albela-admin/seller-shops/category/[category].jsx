import React, { useEffect, useState } from "react";
import AdminHeader from "../../../../components/admin/AdminHeader";
import categoryStyles from "../../../../styles/pages/Category.module.css";
import { db } from "../../../../services/firebase";
import CategoryProduct from "../../../../components/admin/CategoryProduct";
import { useStateValue } from "../../../../context/StateProvider";
import { useRouter } from "next/router";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core";
import _ from "lodash";
import Head from "next/head";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    fontSize: 16,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const Category = ({ products, category }) => {
  const router = useRouter();
  const classes = useStyles();
  const [sortBy, setSortBy] = useState("name_asc");
  const [showLoading, setShowLoading] = useState(true);
  const [{ seller, isAdminValidated }, dispatch] = useStateValue();

  useEffect(() => {
    if (isAdminValidated) {
      if (!seller) {
        router.replace(`/albela-admin/seller-shops/`);
      } else {
        setShowLoading(false);
      }
    } else {
      router.replace("/albela-admin");
    }
  }, [seller, isAdminValidated]);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div className={categoryStyles.category}>
      <Head>
        <title>Albela (Admin) | Product Category for Seller/Shop</title>
      </Head>
      <AdminHeader />
      {products.length ? (
        <div className="headingAndSortContainer">
          <h4 className={categoryStyles.heading}>{category}</h4>

          <FormControl
            size="small"
            variant="standard"
            className={classes.formControl}
          >
            <InputLabel
              style={{ fontSize: 12 }}
              id="demo-simple-select-outlined-label"
            >
              Sort By
            </InputLabel>
            <Select
              style={{ fontSize: 14 }}
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem style={{ fontSize: 14 }} value="name_asc">
                Name (Asc)
              </MenuItem>
              <MenuItem style={{ fontSize: 14 }} value="name_desc">
                Name (Desc)
              </MenuItem>
              <MenuItem style={{ fontSize: 14 }} value="price_l2h">
                Price (Low to High)
              </MenuItem>
              <MenuItem style={{ fontSize: 14 }} value="price_h2l">
                Price (High to Low)
              </MenuItem>
              <MenuItem style={{ fontSize: 14 }} value="discount_l2h">
                Discount (Low to High)
              </MenuItem>
              <MenuItem style={{ fontSize: 14 }} value="discount_h2l">
                Discount (High to Low)
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      ) : (
        <></>
      )}
      <div className={categoryStyles.product__row}>
        {products.length ? (
          sortBy === "name_asc" ? (
            _.sortBy(products, ["name"])?.map((product) => (
              <CategoryProduct
                key={product?.id}
                id={product?.id}
                preview={product?.preview}
                name={product?.name}
                price={product?.price}
                discount={product?.discount}
                unavailable={product?.unavailable}
                by={product?.by}
              />
            ))
          ) : sortBy === "name_desc" ? (
            _.reverse(_.sortBy(products, ["name"]))?.map((product) => (
              <CategoryProduct
                key={product?.id}
                id={product?.id}
                preview={product?.preview}
                name={product?.name}
                price={product?.price}
                discount={product?.discount}
                unavailable={product?.unavailable}
                by={product?.by}
              />
            ))
          ) : sortBy === "price_l2h" ? (
            products
              ?.sort((a, b) =>
                (a.discount && a.discount !== "0"
                  ? Number(
                      (
                        Number(a.price) -
                        (Number(a.price) * Number(a.discount)) / 100
                      ).toFixed(0)
                    )
                  : Number(a.price)) >
                (b.discount && b.discount !== "0"
                  ? Number(
                      (
                        Number(b.price) -
                        (Number(b.price) * Number(b.discount)) / 100
                      ).toFixed(0)
                    )
                  : Number(b.price))
                  ? 1
                  : -1
              )
              .map((product) => (
                <CategoryProduct
                  key={product?.id}
                  id={product?.id}
                  preview={product?.preview}
                  name={product?.name}
                  price={product?.price}
                  discount={product?.discount}
                  unavailable={product?.unavailable}
                  by={product?.by}
                />
              ))
          ) : sortBy === "price_h2l" ? (
            products
              ?.sort((a, b) =>
                (a.discount && a.discount !== "0"
                  ? Number(
                      (
                        Number(a.price) -
                        (Number(a.price) * Number(a.discount)) / 100
                      ).toFixed(0)
                    )
                  : Number(a.price)) <
                (b.discount && b.discount !== "0"
                  ? Number(
                      (
                        Number(b.price) -
                        (Number(b.price) * Number(b.discount)) / 100
                      ).toFixed(0)
                    )
                  : Number(b.price))
                  ? 1
                  : -1
              )
              .map((product) => (
                <CategoryProduct
                  key={product?.id}
                  id={product?.id}
                  preview={product?.preview}
                  name={product?.name}
                  price={product?.price}
                  discount={product?.discount}
                  unavailable={product?.unavailable}
                  by={product?.by}
                />
              ))
          ) : sortBy === "discount_l2h" ? (
            products
              .sort((a, b) =>
                Number(a.discount) > Number(b.discount) ? 1 : -1
              )
              ?.map((product) => (
                <CategoryProduct
                  key={product?.id}
                  id={product?.id}
                  preview={product?.preview}
                  name={product?.name}
                  price={product?.price}
                  discount={product?.discount}
                  unavailable={product?.unavailable}
                  by={product?.by}
                />
              ))
          ) : sortBy === "discount_h2l" ? (
            products
              .sort((a, b) =>
                Number(a.discount) < Number(b.discount) ? 1 : -1
              )
              ?.map((product) => (
                <CategoryProduct
                  key={product?.id}
                  id={product?.id}
                  preview={product?.preview}
                  name={product?.name}
                  price={product?.price}
                  discount={product?.discount}
                  unavailable={product?.unavailable}
                  by={product?.by}
                />
              ))
          ) : (
            <></>
          )
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "grid", placeItems: "center" }}>
              <img
                src="/assets/not-available.png"
                style={{ width: "90%", objectFit: "contain" }}
              />
            </div>
            <p style={{ fontSize: 15, textAlign: "center" }}>
              No products available! <br />
              <span style={{ fontSize: 12 }}>(in {category})</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;

export const getStaticPaths = async () => {
  const snapshot = await db.collection("Categories").get();
  const paths = snapshot.docs.map((doc) => ({
    params: {
      category: doc.id.toString(),
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const categorySnapshot = await db
    .collection("Categories")
    .doc(params.category)
    .get();
  const category = categorySnapshot.data().category;

  const snapshot = await db
    .collection("Products")
    .where("category", "==", params.category)
    .get();
  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    preview: doc.data().preview,
    price: doc.data().price,
    discount: doc.data().discount,
    unavailable: doc.data().unavailable || null,
    by: doc.data().by,
  }));

  return {
    props: {
      products,
      category,
    },
    revalidate: 1,
  };
};
