import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import categoriesBarStyles from "../styles/components/CategoriesBar.module.css";
import CategoryOption from "./CategoryOption";

const CategoriesBar = () => {
  const categories = [
    {
      id: "J3aVRu4zIr9vDCRbzPXx",
      image: "/assets/categories/appliances.svg",
      category: "Appliances",
    },
    {
      id: "QbGOatpUan9cNVr3ZMwi",
      image: "/assets/categories/computers.svg",
      category: "Computers",
    },
    {
      id: "bFgM74HZoNy8qwQWg04t",
      image: "/assets/categories/electronics.svg",
      category: "Electronics",
    },
    {
      id: "fdEINAPWzxKfKm26OBi2",
      image: "/assets/categories/fashion.svg",
      category: "Fashion",
    },
    {
      id: "rd6sL1iugXxyjd2sToae",
      image: "/assets/categories/furniture.svg",
      category: "Furniture",
    },
    {
      id: "YOaai06rhrxVoqAvwWrg",
      image: "/assets/categories/groceries.svg",
      category: "Groceries",
    },
    {
      id: "oDisQZKcKIINqwGvgOJU",
      image: "/assets/categories/home.svg",
      category: "Home",
    },
    {
      id: "rxNSJI2yIcTIAmD86M2K",
      image: "/assets/categories/mobiles.svg",
      category: "Mobiles",
    },
    {
      id: "mMs5h3YDJxgDZoxzwOCe",
      image: "/assets/categories/sports.svg",
      category: "Sports",
    },
  ];

  return (
    <div className={categoriesBarStyles.categoriesBar}>
      <CategoryOption
        key="all"
        id="all"
        image={"/assets/categories/categories.svg"}
        category="All"
      />
      {categories?.map((category) => (
        <CategoryOption
          key={category.id}
          id={category.id}
          image={category.image}
          category={category.category}
        />
      ))}
      <div>&nbsp;&nbsp;</div>
    </div>
  );
};

export default CategoriesBar;
