import React, { useEffect, useState } from "react";
import { useStateValue } from "../../../../context/StateProvider";
import productDetailsStyles from "../../../../styles/pages/ProductDetails.module.css";
import { db, storage } from "../../../../services/firebase";
import AdminHeader from "../../../../components/admin/AdminHeader";
import AdminTop from "../../../../components/admin/AdminTop";
import { CircularProgress } from "@material-ui/core";
import { useRouter } from "next/router";
import Head from "next/head";

const ProductDetails = ({ product, category }) => {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const [{ isAdminValidated }, dispatch] = useStateValue();
  const [showLoading, setShowLoading] = useState(true);

  const deleteProduct = async (e) => {
    e.preventDefault();
    if (
      confirm(
        "Are you sure you want to delete this product?\n(Click 'OK' and the product will be deleted ASAP! and you will be redirected to the previous page)"
      )
    ) {
      setDeleting(true);
      for (const image of product?.preview) {
        await storage.refFromURL(image.url).delete();
      }
      await db.collection("Products").doc(product?.id).delete();
      setDeleting(false);
      router.back();
    }
  };

  useEffect(() => {
    var $ = jQuery.noConflict();
    $(document).ready(function () {
      $("#carouselExampleIndicators").carousel({ interval: 3000, cycle: true });
    });
  }, []);

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
    <div className={productDetailsStyles.productDetails}>
      <Head>
        <title>Albela (Admin) | Product Details</title>
      </Head>
      <AdminHeader />
      <AdminTop sellerID={product?.by} />
      <p className={productDetailsStyles.product__title}>{product?.name}</p>
      <div className={productDetailsStyles.productImage}>
        {product?.discount && (
          <p className={productDetailsStyles.off}>{product?.discount}%</p>
        )}
        <div
          id="carouselExampleIndicators"
          className="carousel slide"
          data-bs-ride="carousel"
          style={{ background: "lightgray" }}
        >
          <div className="carousel-indicators">
            {product?.preview.map((_, index) =>
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
            {product?.preview.map((media, index) =>
              index === 0 ? (
                <div className="carousel-item active">
                  {media.type.includes("image") ? (
                    <img
                      src={media.url}
                      className={`d-block w-100 ${productDetailsStyles.carousel_image}`}
                      alt="..."
                    />
                  ) : (
                    <video
                      className={`d-block w-100 ${productDetailsStyles.carousel_image}`}
                      controls
                      autoPlay
                      muted
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
                      className={`d-block w-100 ${productDetailsStyles.carousel_image}`}
                      controls
                      autoPlay
                      muted
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
          borderBottom: product?.details.length && "1px solid lightgray",
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
      </div>
      {/* Details */}
      {product?.details.length > 0 && (
        <div className={productDetailsStyles.product_details}>
          <p className={productDetailsStyles.headings}>Details</p>
          <table>
            <tbody>
              {product?.details.map((detail, index) => (
                <tr
                  key={index}
                  className={productDetailsStyles.table_row}
                  className={productDetailsStyles.table_row}
                >
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
      {product?.description && (
        <>
          <div className={productDetailsStyles.product_description}>
            <p className={productDetailsStyles.headings}>Description</p>
            <p>{product?.description}</p>
          </div>
          {deleting ? (
            <div
              style={{
                width: "100%",
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress size={30} style={{ color: "#cd9042" }} />
            </div>
          ) : (
            <button
              style={{
                background: "tomato",
                outline: "none",
                border: "1px solid lightgray",
                paddingLeft: 11,
                paddingRight: 11,
                paddingTop: 2,
                paddingBottom: 4,
                borderRadius: 7,
                width: "90%",
                marginLeft: "5%",
              }}
              onClick={deleteProduct}
            >
              Delete
            </button>
          )}
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
    .doc(product?.categoryID)
    .get();
  const category = categorySnapshot.data().category;

  return {
    props: {
      product,
      category,
    },
    revalidate: 1,
  };
};
