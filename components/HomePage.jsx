import React, { useEffect, useState } from "react";
import homeStyles from "../styles/components/Home.module.css";
import Product from "./Product";
import Link from "next/link";

const HomePage = ({ setOpen, categories, products, ads }) => {
  // const images = ["/assets/1.jpg", "/assets/2.jpg", "/assets/3.jpg"];

  useEffect(() => {
    var $ = jQuery.noConflict();
    $(document).ready(function () {
      $("#carouselExampleIndicators").carousel({ interval: 3000, cycle: true });
    });
  }, []);

  return (
    <div className={homeStyles.home}>
      <div className={homeStyles.home__container}>
        <div
          id="carouselExampleIndicators"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          <div className="carousel-indicators">
            {ads?.map((ad, index) =>
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
          <div className={`carousel-inner ${homeStyles.carousel}`}>
            {ads?.map((ad, index) =>
              index === 0 ? (
                <div
                  className={`carousel-item active ${homeStyles.carousel_item}`}
                >
                  <img
                    src={ad.ad}
                    className={`d-block w-100 ${homeStyles.carousel_image}`}
                    alt="ad"
                  />
                </div>
              ) : (
                <div className="carousel-item">
                  <img
                    src={ad.ad}
                    className={`d-block w-100 ${homeStyles.carousel_image}`}
                    alt="ad"
                  />
                </div>
              )
            )}
          </div>
        </div>

        {categories.map((category) =>
          products?.filter((product) => product.categoryID === category.id)
            .length ? (
            <div className={homeStyles.productShowcase}>
              <h3>{category.category}</h3>
              <div className={homeStyles.product__row}>
                {products
                  ?.filter((product) => product.categoryID === category.id)
                  .slice(0, 4)
                  .map((product) => (
                    <Product
                      setOpen={setOpen}
                      key={product?.id}
                      id={product?.id}
                      preview={product?.preview}
                      name={product?.name}
                      price={product?.price}
                      by={product?.by}
                      discount={product?.discount}
                      unavailable={product?.unavailable}
                    />
                  ))}
              </div>
              <Link href={`/category/${category.id}`}>
                <a className={homeStyles.seeMore}>See more and manage</a>
              </Link>
            </div>
          ) : (
            <></>
          )
        )}
      </div>
    </div>
  );
};

export default HomePage;
