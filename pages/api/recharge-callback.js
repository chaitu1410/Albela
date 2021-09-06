// const https = require("https");

import { db } from "../../services/firebase";

// const formidable = require("formidable");
const utilities = require("../../services/utilities.json");
const PaytmChecksum = require("../../paytm/PaytmChecksum");

export default (req, res) => {
  //   const form = new formidable.IncomingForm();

  //   form.parse(req, (error, fields, file) => {
  var paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;

  var isVerifySignature = PaytmChecksum.verifySignature(
    JSON.parse(JSON.stringify(req.body)),
    utilities.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );

  if (isVerifySignature) {
    if (req.body.RESPCODE === "01") {
      db.collection("Sellers")
        .doc(req.body.ORDERID.split("-")[0])
        .get()
        .then((sellerSnapshot) => {
          if (sellerSnapshot.data().rechargeValidity < new Date().getTime()) {
            let validity;
            if (req.body.TXNAMOUNT === "500.00") {
              validity = new Date(
                Date.now() + 336 * 24 * 60 * 60 * 1000
              ).getTime();
            } else if (req.body.TXNAMOUNT === "275.00") {
              validity = new Date(
                Date.now() + 168 * 24 * 60 * 60 * 1000
              ).getTime();
            } else if (req.body.TXNAMOUNT === "168.00") {
              validity = new Date(
                Date.now() + 84 * 24 * 60 * 60 * 1000
              ).getTime();
            } else if (req.body.TXNAMOUNT === "56.00") {
              validity = new Date(
                Date.now() + 28 * 24 * 60 * 60 * 1000
              ).getTime();
            } else if (req.body.TXNAMOUNT === "14.00") {
              validity = new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ).getTime();
            }
            db.collection("Sellers")
              .doc(req.body.ORDERID.split("-")[0])
              .update({
                rechargeValidity: validity,
              })
              .then(() => res.redirect("/seller/recharge"));
          } else {
            let validity;
            if (req.body.TXNAMOUNT === "500.00") {
              validity =
                sellerSnapshot.data().rechargeValidity +
                336 * 24 * 60 * 60 * 1000;
            } else if (req.body.TXNAMOUNT === "275.00") {
              validity =
                sellerSnapshot.data().rechargeValidity +
                168 * 24 * 60 * 60 * 1000;
            } else if (req.body.TXNAMOUNT === "168.00") {
              validity =
                sellerSnapshot.data().rechargeValidity +
                84 * 24 * 60 * 60 * 1000;
            } else if (req.body.TXNAMOUNT === "56.00") {
              validity =
                sellerSnapshot.data().rechargeValidity +
                28 * 24 * 60 * 60 * 1000;
            } else if (req.body.TXNAMOUNT === "14.00") {
              validity =
                sellerSnapshot.data().rechargeValidity +
                7 * 24 * 60 * 60 * 1000;
            }
            db.collection("Sellers")
              .doc(req.body.ORDERID.split("-")[0])
              .update({
                rechargeValidity: validity,
              })
              .then(() => res.redirect("/seller/recharge"));
          }
        });
      res.redirect("/seller/recharge");
    } else {
      res.redirect("/seller/recharge");
    }
    // var paytmParams = {};

    // paytmParams.body = {
    //   mid: req.body.MID,
    //   orderId: req.body.ORDER_ID,
    // };

    // PaytmChecksum.generateSignature(
    //   JSON.stringify(paytmParams.body),
    //   utilities.PAYTM_MERCHANT_KEY
    // ).then((checksum) => {
    //   paytmParams.head = {
    //     signature: checksum,
    //   };

    //   var post_data = JSON.stringify(paytmParams);

    //   var options = {
    //     hostname: "securegw-stage.paytm.in",
    //     // hostname: 'securegw.paytm.in',
    //     port: 443,
    //     path: "/order/status", //      /v3/order/status
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Content-Length": post_data.length,
    //     },
    //   };

    //   var response = "";
    //   var post_req = https.request(options, (post_res) => {
    //     post_res.on("data", (chunk) => {
    //       response += chunk;
    //     });

    //     post_res.on("end", () => {
    //       res.status(200).json(response);
    //     });
    //   });

    //   post_req.write(post_data);
    //   post_req.end();
    // });
  } else {
    res.redirect("/payment-error");
  }
  //   });
  //   res.status(200).json({ error: "Unmatched" });
};
