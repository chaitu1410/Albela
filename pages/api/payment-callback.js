import { db, firebase } from "../../services/firebase";

const utilities = require("../../services/utilities.json");
const PaytmChecksum = require("../../paytm/PaytmChecksum");

export default async (req, res) => {
  var paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;

  var isVerifySignature = PaytmChecksum.verifySignature(
    JSON.parse(JSON.stringify(req.body)),
    utilities.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );

  if (isVerifySignature) {
    if (req.body.RESPCODE === "01") {
      const data = JSON.parse(req.body.MERC_UNQ_REF);
      for (const id of data.newBasket) {
        const doc = await db.collection("Products").doc(id).get();
        const snapshot = await db
          .collection("Sellers")
          .doc(doc.data().by)
          .get();
        if (
          snapshot.data().isVIP ||
          snapshot.data().rechargeValidity >= new Date().getTime()
        ) {
          await db.collection("Orders").add({
            product: id,
            quantity: data.basket.filter((itemID) => itemID === id).length,
            customer: data.customer,
            seller: doc.data().by,
            address: data.address,
            name: data.name,
            phno: data.phno,
            price: `${
              doc.data().discount && doc.data().discount !== "0"
                ? data.basket.filter((itemID) => itemID === id).length *
                  (
                    Number(doc.data().price) -
                    (Number(doc.data().price) * Number(doc.data().discount)) /
                      100
                  ).toFixed(0)
                : data.basket.filter((itemID) => itemID === id).length *
                  Number(doc.data().price)
            }`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            paymentMethod: "Online",
            status: "Ordered",
          });
        }
      }
      db.collection("Users")
        .doc(data.customer)
        .update({ basket: [] })
        .then(() => {
          res.redirect("/orders");
        });
    } else {
      res.redirect("/checkout");
    }
  } else {
    res.redirect("/payment-error");
  }
};
