import React from "react";
import Link from "next/link";
import categoryOptionStyles from "../styles/components/CategoryOption.module.css";
import CategoryOutlinedIcon from "@material-ui/icons/CategoryOutlined";

const CategoryOption = ({ id, image, category }) => {
  return (
    <Link href={category === "All" ? "all-categories" : `/category/${id}`}>
      <a className={categoryOptionStyles.a}>
        <div className={categoryOptionStyles.category}>
          <img src={image} alt="" />
        </div>
        <p style={{ marginBottom: 0 }}>{category}</p>
      </a>
    </Link>
  );
};

export default CategoryOption;
