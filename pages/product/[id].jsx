import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useStateValue } from "../../context/StateProvider";
import productDetailsStyles from "../../styles/pages/ProductDetails.module.css";
import router, { useRouter } from "next/router";
import AddRoundedIcon from "@material-ui/icons/AddRounded";
import RemoveRoundedIcon from "@material-ui/icons/RemoveRounded";
import { CircularProgress, IconButton, Snackbar } from "@material-ui/core";
import { db } from "../../services/firebase";
import { Alert } from "@material-ui/lab";
import Head from "next/head";
import ShoppingCartOutlinedIcon from "@material-ui/icons/ShoppingCartOutlined";
import ZoomInRoundedIcon from "@material-ui/icons/ZoomInRounded";
import ZoomOutRoundedIcon from "@material-ui/icons/ZoomOutRounded";

const ProductDetails = ({ product, category, seller }) => {
  const [{ basket, user }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);
  const [openAdded, setOpenAdded] = useState(false);
  const [openRemoved, setOpenRemoved] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [previewHeight, setPreviewHeight] = useState("55vh");

  const handleCloseAdded = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenAdded(false);
  };
  const handleCloseRemoved = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenRemoved(false);
  };

  const addToBasket = () => {
    if (user) {
      dispatch({
        type: "ADD_TO_BASKET",
        id: product.id,
      });
      setOpenAdded(true);
    } else {
      if (confirm("You must Login first in order to access your Cart")) {
        router.push("/auth/login");
      }
    }
  };
  // const removeFromBasket = () => {
  //   dispatch({
  //     type: "REMOVE_FROM_BASKET",
  //     item: id,
  //   });
  // };
  const removeAllFromBasket = () => {
    dispatch({
      type: "REMOVE_ALL_FROM_BASKET",
      id: product.id,
    });
    setOpenRemoved(true);
  };
  const buyNow = () => {
    const count = 1;
    dispatch({
      type: "SET_PRICE",
      price:
        product?.discount && product?.discount !== "0"
          ? Number(
              (
                Number(product?.price) -
                (Number(product?.price) * Number(product?.discount)) / 100
              ).toFixed(0)
            ) * count
          : Number(product?.price) * count,
    });
    dispatch({
      type: "SET_DIRECT_BUY_PRODUCT",
      directBuyProduct: { product: product?.id, quantity: count },
    });
    router.push("/payment");
    // const count = prompt(
    //   `How many "${product.name}"s do you want?\n\n(Please enter Numbers only)`,
    //   "1"
    // );

    // if (count) {
    //   if (isNaN(count) || count == 0) {
    //     buyNow();
    //   } else {
    //     dispatch({
    //       type: "SET_PRICE",
    //       price:
    //         product?.discount && product?.discount !== "0"
    //           ? Number(
    //               (
    //                 Number(product?.price) -
    //                 (Number(product?.price) * Number(product?.discount)) / 100
    //               ).toFixed(0)
    //             ) * count
    //           : Number(product?.price) * count,
    //     });
    //     dispatch({
    //       type: "SET_DIRECT_BUY_PRODUCT",
    //       directBuyProduct: { product: product?.id, quantity: count },
    //     });
    //     router.push("/payment");
    //   }
    // }
  };

  useEffect(() => {
    var $ = jQuery.noConflict();
    $(document).ready(function () {
      $("#carouselExampleIndicators").carousel({ interval: 3000, cycle: true });
    });
  }, []);

  useEffect(() => {
    if (user && user?.basket !== basket) {
      db.collection("Users").doc(user?.id).update({
        basket: basket,
      });
    }
  }, [basket]);

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
    <div className={productDetailsStyles.productDetails}>
      <Head>
        <title>Albela | Product Details</title>
      </Head>
      <Header />
      <Snackbar
        open={openAdded}
        autoHideDuration={2121}
        onClose={handleCloseAdded}
      >
        <Alert onClose={handleCloseAdded} severity="success">
          Product added to the basket: {product?.name}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openRemoved}
        autoHideDuration={2121}
        onClose={handleCloseRemoved}
      >
        <Alert onClose={handleCloseRemoved} severity="warning">
          Product removed from the basket: {product?.name}
        </Alert>
      </Snackbar>
      <p className={productDetailsStyles.product__title}>{product.name}</p>
      <div className={productDetailsStyles.productImage}>
        <div className={productDetailsStyles.absolutes}>
          {product.discount && (
            <p className={productDetailsStyles.off}>{product.discount}%</p>
          )}
          <IconButton
            className={productDetailsStyles.zoomer}
            onClick={() =>
              previewHeight === "55vh"
                ? setPreviewHeight("calc(100vh - 100px)")
                : setPreviewHeight("55vh")
            }
          >
            {previewHeight === "55vh" ? (
              <ZoomInRoundedIcon fontSize="large" />
            ) : (
              <ZoomOutRoundedIcon fontSize="large" />
            )}
          </IconButton>
        </div>
        <div
          id="carouselExampleIndicators"
          className="carousel slide"
          data-bs-ride="carousel"
          style={{ background: "lightgray" }}
        >
          <div className="carousel-indicators">
            {product.preview.map((_, index) =>
              index === 0 ? (
                <button
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide-to="0"
                  className="active indicator"
                  aria-current="true"
                  aria-label="Slide 1"
                ></button>
              ) : (
                <button
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide-to={index}
                  className="indicator"
                  aria-label={`Slide ${index + 1}`}
                ></button>
              )
            )}
          </div>
          <div className="carousel-inner">
            {product.preview.map((media, index) =>
              index === 0 ? (
                <div className="carousel-item active">
                  {media.type.includes("image") ? (
                    <img
                      // onClick={() =>
                      //   previewHeight === "55vh"
                      //     ? setPreviewHeight("calc(100vh - 100px)")
                      //     : setPreviewHeight("55vh")
                      // }
                      src={media.url}
                      className={`d-block w-100 ${productDetailsStyles.carousel_image}`}
                      alt="..."
                      style={{ height: previewHeight }}
                    />
                  ) : (
                    <video
                      // onClick={() =>
                      //   previewHeight === "55vh"
                      //     ? setPreviewHeight("calc(100vh - 100px)")
                      //     : setPreviewHeight("55vh")
                      // }
                      controls
                      autoPlay
                      muted
                      className={`d-block w-100 ${productDetailsStyles.carousel_image}`}
                      style={{ height: previewHeight }}
                    >
                      <source src={media.url} />
                    </video>
                  )}
                </div>
              ) : (
                <div className="carousel-item">
                  {media.type.includes("image") ? (
                    <img
                      src={media.url}
                      className={`d-block w-100 ${productDetailsStyles.carousel_image}`}
                      alt="..."
                    />
                  ) : (
                    <video
                      controls
                      autoPlay
                      muted
                      className={`d-block w-100 ${productDetailsStyles.carousel_image}`}
                    >
                      <source src={media.url} />
                    </video>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      {/* Info */}
      <div
        className={productDetailsStyles.product__info}
        style={{
          borderBottom: product.details.length && "1px solid lightgray",
        }}
      >
        <p className={productDetailsStyles.product__price}>
          <strong style={{ marginRight: 7 }}>
            ₹
            {product?.discount && product?.discount !== "0"
              ? (
                  Number(product?.price) -
                  (Number(product?.price) * Number(product?.discount)) / 100
                ).toFixed(0)
              : product?.price}
          </strong>
          {product?.discount && product?.discount !== "0" && (
            <small className="strike">₹{product?.price}</small>
          )}
        </p>
        <p className={productDetailsStyles.product__category}>({category})</p>

        {basket.includes(product.id) ? (
          // <div
          //   className="counters"
          //   style={{ justifyContent: "flex-start", marginLeft: 21 }}
          // >
          //   <IconButton onClick={removeFromBasket} className="counter_buttons">
          //     <RemoveRoundedIcon />
          //   </IconButton>
          //   <p className="itemCount">
          //     {basket.filter((item) => item.id === id).length}
          //   </p>
          //   <IconButton onClick={addToBasket} className="counter_buttons">
          //     <AddRoundedIcon />
          //   </IconButton>
          // </div>
          <div className={productDetailsStyles.basket__buttons}>
            <button
              className={productDetailsStyles.addToBasketButton}
              onClick={() => router.push("/checkout")}
              style={{ marginTop: 4 }}
            >
              Go to Basket
            </button>
            <button
              className={productDetailsStyles.addToBasketButton}
              onClick={removeAllFromBasket}
              style={{ background: "lightgray", marginTop: 4 }}
            >
              Remove from Basket
            </button>
          </div>
        ) : (
          <div className={productDetailsStyles.basket__buttons}>
            <button
              className={productDetailsStyles.addToBasketButton}
              onClick={buyNow}
              style={{ marginTop: 4 }}
            >
              <ShoppingCartOutlinedIcon fontSize="small" /> Buy Now
            </button>
            <button
              className={productDetailsStyles.addToBasketButton}
              onClick={addToBasket}
              style={{ marginTop: 4 }}
            >
              <AddRoundedIcon fontSize="small" /> Add to Basket
            </button>
          </div>
        )}
      </div>
      {/* Details */}
      {product.details.length > 0 && (
        <div className={productDetailsStyles.product_details}>
          <p className={productDetailsStyles.headings}>Details</p>
          <table>
            <tbody>
              {product.details.map((detail, index) => (
                <tr key={index} className={productDetailsStyles.table_row}>
                  <td>{detail.detailKey}</td>
                  <td className={productDetailsStyles.value}>
                    {detail.detailValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={productDetailsStyles.product_details}>
        <p className={productDetailsStyles.headings}>Seller Info.</p>
        <table>
          <tbody>
            <tr className={productDetailsStyles.table_row}>
              <td>Seller</td>
              <td className={productDetailsStyles.value}>
                {seller.sellerName}
              </td>
            </tr>
            <tr className={productDetailsStyles.table_row}>
              <td>Shop</td>
              <td className={productDetailsStyles.value}>{seller.shopName}</td>
            </tr>
            <tr className={productDetailsStyles.table_row}>
              <td>Address</td>
              <td className={productDetailsStyles.value}>
                {seller.shopAddress}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {product.description && (
        <>
          <div className={productDetailsStyles.product_description}>
            <p className={productDetailsStyles.headings}>Description</p>
            <p style={{ color: "gray" }}>
              {product.description.length > 171
                ? product.description.slice(
                    0,
                    showMore ? product.description.length : 171
                  )
                : product.description}
              <span
                onClick={() => setShowMore(!showMore)}
                style={{ color: "blue", cursor: "pointer" }}
              >
                {showMore ? "\nshow less" : "... read more"}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductDetails;

export const getStaticPaths = async () => {
  const snapshot = await db.collection("Products").get();
  const paths = snapshot.docs.map((doc) => ({
    params: {
      id: doc.id.toString(),
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const snapshot = await db.collection("Products").doc(params.id).get();
  const product = {
    id: snapshot.id,
    name: snapshot.data().name,
    preview: snapshot.data().preview,
    categoryID: snapshot.data().category,
    price: snapshot.data().price,
    discount: snapshot.data().discount,
    description: snapshot.data().description,
    details: snapshot.data().details,
    by: snapshot.data().by,
  };

  const categorySnapshot = await db
    .collection("Categories")
    .doc(product.categoryID)
    .get();
  const category = categorySnapshot.data().category;

  const sellerSnapshot = await db.collection("Sellers").doc(product.by).get();
  const seller = {
    shopName: sellerSnapshot.data().shopName,
    sellerName: sellerSnapshot.data().name,
    shopAddress: sellerSnapshot.data().shopAddress,
  };

  return {
    props: {
      product,
      category,
      seller,
    },
    revalidate: 1,
  };
};
