const utilities = require("../../services/utilities.json");
const { v4: uuidv4 } = require("uuid");

export default (req, res) => {
  if (req.method == "GET") {
    res.status(200).json({ Success: "Success" });
  } else {
    var PaytmChecksum = require("../../paytm/PaytmChecksum");

    var params = {};

    /* initialize an array */
    params["MID"] = utilities.PAYTM_MID.toString();
    params["ORDER_ID"] = `${req.body.sellerID}-${new Date().getTime()}`;
    params["CUST_ID"] = uuidv4();
    params["INDUSTRY_TYPE_ID"] = "Retail";
    params["WEBSITE"] = "WEBSTAGING";
    params["CHANNEL_ID"] = "WEB";
    params["TXN_AMOUNT"] = req.body.price;
    params["MOBILE_NO"] = req.body.phno;
    params["MERC_UNQ_REF"] = JSON.stringify({
      basket: req.body.basket,
      newBasket: req.body.newBasket,
      customer: req.body.customer,
      name: req.body.name,
      address: req.body.address,
      phno: req.body.phno,
    });
    params["CALLBACK_URL"] = "http://localhost:3000/api/payment-callback";
    // "https://classical-shop.vercel.app/api/payment-callback";

    var paytmChecksum = PaytmChecksum.generateSignature(
      params,
      utilities.PAYTM_MERCHANT_KEY
    );
    paytmChecksum
      .then((checksum) => {
        const paytmParams = {
          ...params,
          CHECKSUMHASH: checksum,
        };

        res.status(200).json(paytmParams);
      })
      .catch((error) => {
        res.status(200).json({ error: error });
      });
  }
};
