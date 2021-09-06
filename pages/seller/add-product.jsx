import { CircularProgress, IconButton, Snackbar } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import DashboardHeader from "../../components/seller/DashboardHeader";
import { db, storage } from "../../services/firebase";
import { Alert, Autocomplete } from "@material-ui/lab";
import addProductStyles from "../../styles/pages/seller/AddProduct.module.css";
import RemoveCircleOutlineRoundedIcon from "@material-ui/icons/RemoveCircleOutlineRounded";
import { useStateValue } from "../../context/StateProvider";
import { useRouter } from "next/router";
import Head from "next/head";

export const getStaticProps = async () => {
  const categoriesSnapshot = await db.collection("Categories").get();
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

const AddProduct = ({ categories }) => {
  const [media, setMedia] = useState(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState([]);
  const [adding, setAdding] = useState(false);
  const [{ user }, dispatch] = useStateValue();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const options = categories.map((option) => {
    const firstLetter = option.category[0].toUpperCase();
    return {
      firstLetter: /[0-9]/.test(firstLetter) ? "0-9" : firstLetter,
      ...option,
    };
  });

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...details];
    list[index][name] = value;
    setDetails(list);
  };

  // handle click event of the Remove button
  const handleRemoveClick = (index) => {
    const list = [...details];
    list.splice(index, 1);
    setDetails(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setDetails([...details, { detailKey: "", detailValue: "" }]);
  };

  const add = async (e) => {
    e.preventDefault();
    setAdding(true);

    if (media === null || (media && (media.length === 0 || media.length > 4))) {
      alert("Select at least 1 image or video (Maximum limit is 4)");
      setAdding(false);
    } else if (productName.trim().length < 2) {
      alert("Product name must be at least 2 characters long");
      setAdding(false);
    } else if (!category) {
      alert("You must specify a category");
      setAdding(false);
    } else if (price.toString().trim().length < 2) {
      alert("Product price must be in tens");
      setAdding(false);
    } else if (description.trim().length < 11) {
      alert("Product description must be at least 10 characters long");
      setAdding(false);
    } else {
      let proceed = false;
      for (let index = 0; index < media.length; index++) {
        if (media[index].type.includes("image")) {
          proceed = true;
        }
      }

      if (proceed) {
        const validatedDetails = details.filter(
          (detail) =>
            detail.detailKey.length > 1 && detail.detailValue.length > 1
        );

        const preview = [];
        for (let index = 0; index < media.length; index++) {
          if (
            media[index].type.includes("video") ||
            media[index].type.includes("image")
          ) {
            const storageRef = await storage.ref(
              `/products/${user?.sellerID}/${media[index].name}-${new Date()}`
            );
            await storageRef.put(media[index]);
            const url = await storageRef.getDownloadURL();

            preview.push({ index, type: media[index].type, url });
          }
        }
        db.collection("Products")
          .add({
            preview,
            name: productName,
            category,
            price,
            discount,
            description,
            details: validatedDetails,
            by: user?.sellerID,
            unavailable: false,
          })
          .then(() => {
            router.reload();
          });
      } else {
        alert("You must select at least one image");
        setAdding(false);
      }
    }
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
              if (!data.data().isSeller) {
                router.replace("/seller/register");
              } else {
                setShowLoading(false);
              }
            } else {
              setShowLoading(false);
              router.replace("/auth/login");
            }
          });
      } else {
        router.replace("/auth/login");
      }
    } else {
      if (!user.isSeller) {
        router.replace("/seller/register");
      } else {
        setShowLoading(false);
      }
    }
  }, []);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <>
      <Head>
        <title>Albela (Seller) | Add Product</title>
      </Head>
      <DashboardHeader />

      <Snackbar open={open} autoHideDuration={1111} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info">
          Product added successfully!!
        </Alert>
      </Snackbar>
      <div className={addProductStyles.container}>
        <form className={addProductStyles.form}>
          <h3 style={{ textAlign: "center" }}>Add Product</h3>
          <input
            type="file"
            name="media"
            id="media"
            multiple
            accept="image/*, video/*"
            style={{ alignSelf: "center", textAlign: "center" }}
            onChange={(e) => {
              if (e.target.files.length > 4) {
                setMedia(null);
                document.getElementById("media").value = "";
                alert("You can only select 4 files");
              } else {
                setMedia(null);
                setMedia(e.target.files);
              }
            }}
            max={3}
          />
          <p style={{ color: "gray", fontSize: 14 }}>
            First image selected will be shown on Product Card
          </p>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className={addProductStyles.inputs}
            type="text"
            name="name"
            id="name"
            placeholder="Enter Product name"
          />
          <Autocomplete
            id="combobox"
            size="small"
            onChange={(_, value) =>
              value ? setCategory(value.id) : setCategory("")
            }
            style={{
              width: "100%",
              outline: "none",
              fontSize: 14,
            }}
            options={options.sort(
              (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
            )}
            groupBy={(option) => option.firstLetter}
            getOptionLabel={(option) => option.category}
            renderInput={(params) => (
              <div ref={params.InputProps.ref}>
                <input
                  placeholder="Select product category"
                  type="text"
                  {...params.inputProps}
                  className={addProductStyles.inputs}
                />
              </div>
            )}
          />
          <input
            value={price}
            onChange={(e) => {
              if (e.target.value === "0" && price === "") {
                return;
              }
              setPrice(e.target.value.replace(/[^\d]/, ""));
            }}
            className={addProductStyles.inputs}
            type="text"
            name="price"
            id="price"
            placeholder="Enter Product price"
          />
          <input
            value={discount}
            onChange={(e) => setDiscount(e.target.value.replace(/[^\d]/, ""))}
            maxLength={2}
            className={addProductStyles.inputs}
            type="text"
            name="discount"
            id="discount"
            placeholder="Enter Discount (Percentage)"
          />
          <textarea
            placeholder="Enter Product Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            style={{ marginTop: "2px" }}
            className={addProductStyles.inputs}
            name="description"
            id="description"
            cols="30"
            rows="10"
          ></textarea>
          <div className={addProductStyles.details}>
            <div>
              {details.map((object, index) => (
                <div key={index} className={addProductStyles.details_fields}>
                  <input
                    className={addProductStyles.inputs}
                    type="text"
                    name="detailKey"
                    id={`Key-${index}`}
                    placeholder={`Criteria`}
                    value={object.detailKey}
                    onChange={(e) => handleInputChange(e, index)}
                  />
                  <input
                    className={addProductStyles.inputs}
                    type="text"
                    name="detailValue"
                    id={`Value-${index}`}
                    placeholder={`Value`}
                    value={object.detailValue}
                    onChange={(e) => handleInputChange(e, index)}
                  />
                  <IconButton onClick={() => handleRemoveClick(index)}>
                    <RemoveCircleOutlineRoundedIcon
                      fontSize="small"
                      style={{ color: "tomato" }}
                    />
                  </IconButton>
                </div>
              ))}
            </div>
            <div
              className={addProductStyles.add_field}
              onClick={handleAddClick}
            >
              Add details <AddCircleRoundedIcon style={{ marginLeft: 4 }} />
            </div>
            {details.length ? (
              <p style={{ color: "gray", fontSize: 14 }}>
                Your product details must be at least 2 characters long pairs
                else it will not be added with product.
              </p>
            ) : null}
          </div>
          {adding ? (
            <div style={{ display: "grid", placeItems: "center" }}>
              <CircularProgress size={24} />
            </div>
          ) : (
            <button
              type="submit"
              onClick={add}
              id="registerButton"
              className={addProductStyles.addButton}
            >
              Add
            </button>
          )}
        </form>
      </div>
    </>
  );
};

export default AddProduct;
