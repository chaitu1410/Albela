import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Product from "../../components/Product";
import searchStyles from "../../styles/pages/Search.module.css";
import { db } from "../../services/firebase";
import { useStateValue } from "../../context/StateProvider";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
} from "@material-ui/core";
import CategoryProduct from "../../components/CategoryProduct";
import { Alert } from "@material-ui/lab";
import _ from "lodash";
import Head from "next/head";
import { makeStyles } from "@material-ui/core";

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

const SearchString = () => {
  const router = useRouter();
  const classes = useStyles();
  const { searchString } = router.query;
  const [showLoading, setShowLoading] = useState(true);
  const [{ user }, dispatch] = useStateValue();
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState("name_asc");

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
              // setShowLoading(false);
            } else {
              // setShowLoading(false);
              router.replace("/auth/login");
            }
          });
      } else {
        router.replace("/auth/login");
      }
    } else {
      // setShowLoading(false);
    }
  }, []);

  useEffect(() => {
    db.collection("Products")
      .get()
      .then((snapshot) => {
        const allProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          preview: doc.data().preview,
          categoryID: doc.data().category,
          price: doc.data().price,
          discount: doc.data().discount,
          unavailable: doc.data().unavailable,
          details: doc.data().details,
          by: doc.data().by,
        }));

        setProducts(
          allProducts.filter((product) =>
            product.name
              .toLowerCase()
              .includes(searchString.toString().toLowerCase())
          )
        );

        setShowLoading(false);
      });
  }, [searchString]);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div>
      <Head>
        <title>Albela | Search</title>
      </Head>
      <Header />
      <Snackbar open={open} autoHideDuration={1111} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info">
          This product is unavailable!
        </Alert>
      </Snackbar>
      {products.length ? (
        <div className="headingAndSortContainer">
          <h4 className={searchStyles.heading}>
            <small>Results for:</small> {searchString}
          </h4>
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
      <div className={searchStyles.product__row}>
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
                  setOpen={setOpen}
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
                  setOpen={setOpen}
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
                  setOpen={setOpen}
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
                  setOpen={setOpen}
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
              <span style={{ fontSize: 12 }}>(in {searchString})</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchString;
