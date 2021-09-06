import {
  CircularProgress,
  FormControlLabel,
  IconButton,
  Snackbar,
  Switch,
  withStyles,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import DashboardHeader from "../../components/seller/DashboardHeader";
import { db, storage } from "../../services/firebase";
import firebase from "firebase";
import { Alert, Autocomplete } from "@material-ui/lab";
import addProductStyles from "../../styles/pages/seller/AddProduct.module.css";
import RemoveCircleOutlineRoundedIcon from "@material-ui/icons/RemoveCircleOutlineRounded";
import { useStateValue } from "../../context/StateProvider";
import { useRouter } from "next/router";
import RemoveCircleRoundedIcon from "@material-ui/icons/RemoveCircleRounded";
import { lightGreen } from "@material-ui/core/colors";
import Head from "next/head";

const VIPSwitch = withStyles((theme) => ({
  switchBase: {
    color: "#131921",
    "&$checked": {
      color: "white",
      "& + $track": {
        backgroundColor: "#52d869",
        opacity: 1,
        border: "none",
      },
    },
    "&$checked + $track": {
      backgroundColor: lightGreen[500],
    },
  },
  track: {
    borderRadius: 26 / 2,
    backgroundColor: "red",
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

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

const EditProduct = ({ categories }) => {
  const [isUnavailable, setUnavailable] = useState(false);
  const [media, setMedia] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [{ user, product }, dispatch] = useStateValue();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openAvailable, setOpenAvailable] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const handleCloseAvailable = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenAvailable(false);
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

  const update = async (e) => {
    e.preventDefault();
    setUpdating(true);

    if (
      uploadedMedia.length === 0 &&
      (media === null || (media && (media.length === 0 || media.length > 4)))
    ) {
      alert("Select at least 1 image or video (Maximum limit is 4)");
      setUpdating(false);
    } else if (productName.trim().length < 2) {
      alert("Product name must be at least 2 characters long");
      setUpdating(false);
    } else if (!category) {
      alert("You must specify a category");
      setUpdating(false);
    } else if (price.toString().trim().length < 2) {
      alert("Product price must be in tens");
      setUpdating(false);
    } else if (
      description.trim().length > 0 &&
      description.trim().length < 11
    ) {
      alert("Product description must be at least 10 characters long");
      setUpdating(false);
    } else {
      let proceed = false;
      const allMedia = media ? [...media, ...uploadedMedia] : uploadedMedia;
      for (let index = 0; index < allMedia.length; index++) {
        if (allMedia[index].type.includes("image")) {
          proceed = true;
        }
      }

      if (proceed) {
        const validatedDetails = details.filter(
          (detail) =>
            detail.detailKey.length > 1 && detail.detailValue.length > 1
        );

        const preview = [];
        if (media) {
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
        }

        db.collection("Products")
          .doc(product)
          .update({
            preview: firebase.firestore.FieldValue.arrayUnion(...preview),
            name: productName,
            category,
            price,
            discount,
            details: validatedDetails,
          })
          .then(() => {
            setOpen(true);
            setMedia(null);
            document.getElementById("media").value = "";
            setUpdating(false);
          });
      } else {
        alert("You must have at least one image as a preview");
        setUpdating(false);
      }
    }
  };

  const deleteMedia = async (url, item) => {
    if (
      confirm(
        "Are you sure you want to delete this item?\n(Click 'OK' and the item will be deleted ASAP!)"
      )
    ) {
      await storage.refFromURL(url).delete();
      await db
        .collection("Products")
        .doc(product)
        .update({
          preview: firebase.firestore.FieldValue.arrayRemove(item),
        });
    }
  };

  const handleAvailability = () => {
    db.collection("Products")
      .doc(product)
      .update({
        unavailable: !isUnavailable,
      })
      .then(() => {
        setOpenAvailable(true);
      });
  };

  useEffect(() => {
    if (product) {
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
    } else {
      router.replace("/seller/edit-delete-products");
    }
  }, [product]);

  useEffect(() => {
    let snapshot;
    if (user) {
      snapshot = db
        .collection("Products")
        .doc(product)
        .onSnapshot((doc) => {
          setUnavailable(doc.data().unavailable);
          setUploadedMedia(doc.data().preview);
          setProductName(doc.data().name);
          setPrice(doc.data().price);
          setDiscount(doc.data().discount);
          setDetails(doc.data().details);
          setDescription(doc.data().description || "");
          setCategory(doc.data().category);

          db.collection("Categories")
            .doc(doc.data().category)
            .get()
            .then(
              (data) =>
                (document.getElementById(
                  "combobox"
                ).value = data.data().category)
            );
        });
    }

    return () => {
      if (user) {
        snapshot();
      }
    };
  }, [user]);

  useEffect(() => {
    if (
      document.getElementById("combobox") &&
      !document.getElementById("combobox").value &&
      category
    ) {
      db.collection("Categories")
        .doc(category)
        .get()
        .then(
          (data) =>
            (document.getElementById("combobox").value = data.data().category)
        );
    }
  }, [productName, price, discount, description, details]);

  return showLoading ? (
    <div className="progressDiv">
      <img src="/assets/icon.png" className="loaderImage" alt="" />
      <CircularProgress style={{ color: "#cd9042" }} />
    </div>
  ) : (
    <>
      <Head>
        <title>Albela (Seller) | Edit Product</title>
      </Head>
      <DashboardHeader />
      <Snackbar open={open} autoHideDuration={1111} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info">
          "{productName.trim()}" Edited!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openAvailable}
        autoHideDuration={1111}
        onClose={handleCloseAvailable}
      >
        <Alert onClose={handleCloseAvailable} severity="info">
          "{productName.trim()}" is now{" "}
          {isUnavailable ? "Unavailable" : "Available"}
        </Alert>
      </Snackbar>
      <div className={addProductStyles.container}>
        <form className={addProductStyles.form}>
          <h3 style={{ textAlign: "center" }}>Edit Product</h3>
          <div className={addProductStyles.preview}>
            {uploadedMedia?.map((uploadedItem) => (
              <div className={addProductStyles.product__image}>
                {uploadedItem.type.includes("image") ? (
                  <img
                    src={uploadedItem.url}
                    alt=""
                    className={addProductStyles.image}
                  />
                ) : (
                  <video
                    src={uploadedItem.url}
                    alt=""
                    className={addProductStyles.image}
                    autoPlay
                  />
                )}
                <IconButton
                  className={addProductStyles.removeButton}
                  onClick={() => deleteMedia(uploadedItem.url, uploadedItem)}
                >
                  <RemoveCircleRoundedIcon
                    fontSize="small"
                    style={{ color: "red" }}
                  />
                </IconButton>
              </div>
            ))}
          </div>
          <input
            type="file"
            name="media"
            id="media"
            multiple
            accept="image/*, video/*"
            style={{ alignSelf: "center", textAlign: "center" }}
            onChange={(e) => {
              if (e.target.files.length > 4 - uploadedMedia?.length) {
                setMedia(null);
                document.getElementById("media").value = "";
                alert("Your preview media length exceed");
              } else {
                db.collection("Categories")
                  .doc(category)
                  .get()
                  .then(
                    (data) =>
                      (document.getElementById(
                        "combobox"
                      ).value = data.data().category)
                  );
                setMedia(null);
                setMedia(e.target.files);
              }
            }}
            max={3}
          />
          <p style={{ color: "gray", fontSize: 14 }}>
            First image selected will be shown on Product Card
          </p>
          <FormControlLabel
            style={{
              display: "inline-flex",
              fontSize: 12,
              color: "#333",
              fontWeight: "unset",
            }}
            labelPlacement="start"
            control={
              <VIPSwitch
                checked={!isUnavailable}
                onChange={handleAvailability}
                name="Available"
              />
            }
            label="Available"
          />
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
            type="number"
            name="price"
            id="price"
            placeholder="Enter Product price"
          />
          <input
            value={discount}
            onChange={(e) => setDiscount(e.target.value.replace(/[^\d]/, ""))}
            maxLength={2}
            className={addProductStyles.inputs}
            type="number"
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
                else it will not be added with product
              </p>
            ) : null}
          </div>
          {updating ? (
            <div style={{ display: "grid", placeItems: "center" }}>
              <CircularProgress size={24} />
            </div>
          ) : (
            <button
              type="submit"
              onClick={update}
              id="registerButton"
              className={addProductStyles.addButton}
            >
              Update
            </button>
          )}
        </form>
      </div>
    </>
  );
};

export default EditProduct;
