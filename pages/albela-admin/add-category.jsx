import { CircularProgress, IconButton, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import CategoryCard from "../../components/admin/CategoryCard";
import { db } from "../../services/firebase";
import addCategoryStyles from "../../styles/pages/admin/AddCategory.module.css";
import AddBoxRoundedIcon from "@material-ui/icons/AddBoxRounded";
import { useStateValue } from "../../context/StateProvider";
import { useRouter } from "next/router";
import Head from "next/head";

const AddCategory = () => {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [openEdited, setOpenEdited] = useState(false);
  const [openDeleted, setOpenDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [{ isAdminValidated }, dispatch] = useStateValue();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const handleCloseEdited = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenEdited(false);
  };
  const handleCloseDeleted = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenDeleted(false);
  };

  const addCategory = () => {
    if (category.trim().length > 0) {
      db.collection("Categories")
        .add({
          category,
        })
        .then(() => {
          setCategory("");
          setOpen(true);
        });
    }
  };

  useEffect(() => {
    if (isAdminValidated) {
      db.collection("Categories")
        .orderBy("category")
        .onSnapshot((categoriesSnapshot) => {
          setCategories(
            categoriesSnapshot.docs
              .map((doc) => ({
                id: doc.id,
                category: doc.data().category,
              }))
              .filter(
                (category) =>
                  ![
                    "J3aVRu4zIr9vDCRbzPXx",
                    "QbGOatpUan9cNVr3ZMwi",
                    "bFgM74HZoNy8qwQWg04t",
                    "fdEINAPWzxKfKm26OBi2",
                    "rd6sL1iugXxyjd2sToae",
                    "YOaai06rhrxVoqAvwWrg",
                    "oDisQZKcKIINqwGvgOJU",
                    "rxNSJI2yIcTIAmD86M2K",
                    "mMs5h3YDJxgDZoxzwOCe",
                  ].includes(category.id)
              )
          );
          setLoading(false);
        });
    } else {
      router.replace("/albela-admin");
    }
  }, [isAdminValidated]);

  return loading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <div className={addCategoryStyles.addCategory}>
      <Head>
        <title>Albela (Admin) | Add Category</title>
      </Head>
      <AdminHeader />
      <Snackbar open={open} autoHideDuration={1111} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info">
          Category addeed successfully!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openEdited}
        autoHideDuration={1111}
        onClose={handleCloseEdited}
      >
        <Alert onClose={handleCloseEdited} severity="info">
          Category updated successfully!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openDeleted}
        autoHideDuration={1111}
        onClose={handleCloseDeleted}
      >
        <Alert onClose={handleCloseDeleted} severity="warning">
          Category deleted successfully along with associated Products!
        </Alert>
      </Snackbar>
      <div className={addCategoryStyles.container}>
        <div className={addCategoryStyles.input__container}>
          <input
            autoCapitalize
            className={addCategoryStyles.inputs}
            type="text"
            name="category"
            id="category"
            placeholder="Add Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addCategory();
              }
            }}
          />
          <IconButton
            onClick={addCategory}
            className={addCategoryStyles.addIcon}
          >
            <AddBoxRoundedIcon style={{ color: "#131921" }} />
          </IconButton>
        </div>
        {categories?.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            category={category.category}
            setOpenEdited={setOpenEdited}
            setOpenDeleted={setOpenDeleted}
          />
        ))}
      </div>
    </div>
  );
};

export default AddCategory;
