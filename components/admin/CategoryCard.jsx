import React, { useState } from "react";
import categoryCardStyles from "../../styles/components/admin/CategoryCard.module.css";
import EditRoundedIcon from "@material-ui/icons/EditRounded";
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from "@material-ui/core";
import { db, storage } from "../../services/firebase";

const CategoryCard = ({ id, category, setOpenEdited, setOpenDeleted }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCategory, setEditedCategory] = useState(category);

  const deleteCategory = () => {
    if (
      confirm(
        `Are you sure to delete this category: "${category}"?\n (All the Products associated with it will also be deleted)`
      )
    ) {
      db.collection("Products")
        .where("category", "==", id)
        .get()
        .then(async (snapshot) => {
          for (const doc of snapshot.docs) {
            for (const image of doc.data().preview) {
              await storage.refFromURL(image.url).delete();
            }
            for (const orderDoc of (
              await db.collection("Orders").where("product", "==", doc.id).get()
            ).docs) {
              await db.collection("Orders").doc(orderDoc.id).delete();
            }
            await db.collection("Products").doc(doc.id).delete();
          }
          await db.collection("Categories").doc(id).delete();
          setOpenDeleted(true);
        });
    }
  };

  return (
    <div className={categoryCardStyles.categoryCard}>
      {isEditMode ? (
        <input
          autoFocus
          className={categoryCardStyles.inputs}
          type="text"
          name="category"
          id="category"
          placeholder="Add Category"
          value={editedCategory}
          onChange={(e) => setEditedCategory(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && category.trim().length > 0) {
              db.collection("Categories")
                .doc(id)
                .update({
                  category: editedCategory,
                })
                .then(() => {
                  setIsEditMode(false);
                  setOpenEdited(true);
                });
            }
          }}
        />
      ) : (
        <p className={categoryCardStyles.categoryName}>{category}</p>
      )}
      <div>
        <IconButton
          style={{ padding: 4 }}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          <EditRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton style={{ padding: 4 }} onClick={deleteCategory}>
          <DeleteIcon fontSize="small" style={{ color: "tomato" }} />
        </IconButton>
      </div>
    </div>
  );
};

export default CategoryCard;
