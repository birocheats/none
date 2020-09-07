const checksum_lib = require("./checksum");
const config = require("./server");
const paymentTransaction = require("../models/paymentTransaction");
const User = require("../models/user");

const callBackUrlAfterPaymentValidate = "http://localhost:3000/callback/";

const paymentFailedHTML =
  "<html><body><script>alert('PAYMENT FAILED');window.location.href='/wallet';</script></body></html>";

module.exports.paytm = async (req, res) => {
  try {
    let {
      body: { amount, email: customerEmail, phone: customerPhone } = {},
      user: { _id: customerId } = {}
    } = req || {};
    customerPhone = customerPhone.trim() || "XXXXX-XXXXX";
    if (
      !amount ||
      Number(amount) <= 0 ||
      !customerId ||
      !customerEmail ||
      !customerPhone
    ) {
      throw "INVALID PARAMS";
    }

    let params = {};
    params["MID"] = config.PaytmConfig.mid;
    params["WEBSITE"] = config.PaytmConfig.website;
    params["CHANNEL_ID"] = "WEB";
    params["INDUSTRY_TYPE_ID"] = "Retail";
    params["ORDER_ID"] = "TEST_" + new Date().getTime();
    params["CUST_ID"] = customerId;
    params["TXN_AMOUNT"] = amount;
    params["CALLBACK_URL"] = callBackUrlAfterPaymentValidate;
    params["EMAIL"] = customerEmail;
    params["MOBILE_NO"] = customerPhone;
    // params["enablePaymentMode"] = { mode: "UPI", channels: "UPI" };
    // params["DISABLE_PAYMENT_MODE"] = [
    //   { mode: ["DEBIT_CARD", "NET_BANKING", "EMI", "CREDIT_CARD"] }
    // ];
    try {
      await paymentTransaction.findOneAndUpdate(
        { user: req.user, isComplete: false },
        {
          _updatedOn: new Date(),
          status: "ERROR",
          isError: true,
          isComplete: true,
          error: {
            message: "INITIATE ANOTHER TXN",
            code: 510
          }
        }
      );
      console.log("OLD DATA REMOVEDDDD");
    } catch (e) {
      console.log(e, ">>error in remove data");
    }
    await paymentTransaction.create({
      user: req.user,
      tx_Data: { ...params },
      status: "INITIATE",
      isError: false,
      isComplete: false
    });
    const cb_AfterChucksum = (err, checksum) => {
      // let txn_url = "https://securegw-stage.paytm.in/order/process"; // for staging
      let txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
      let form_fields = "";
      for (let x in params) {
        form_fields +=
          "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
      }
      form_fields +=
        "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

      res.write(
        '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
          txn_url +
          '" name="f1">' +
          form_fields +
          '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
      );
      res.end();
    };
    checksum_lib.genchecksum(params, config.PaytmConfig.key, cb_AfterChucksum);
  } catch (err) {
    console.log(err, "<<<");
    try {
      await paymentTransaction.findOneAndUpdate(
        { user: req.user, isComplete: false, status: "INITIATE" },
        {
          _updatedOn: new Date(),
          status: "ERROR",
          isError: true,
          isComplete: true,
          error: {
            message: err.message || err.stack || "err in module.exports.paytm",
            code: err.code
          }
        }
      );
    } catch (e) {}
    res.send(paymentFailedHTML);
    return;
  }
};

// {
//   ORDERID: 'TEST_1598198235696',
//   MID: 'RizUXv94180712564377',
//   TXNAMOUNT: '0.00',
//   CURRENCY: 'INR',
//   STATUS: 'TXN_FAILURE',
//   RESPCODE: '308',
//   RESPMSG: 'Invalid Txn Amount',
//   BANKTXNID: '',
//   CHECKSUMHASH: 'ZTfR+eeRjnFSkpvN1n3i3bO4HQFwOjYR0iX4mR6IMO4gyHwq5ABhG/sVvH6YSDdiR+r4nZHiCA49hz5CMyEgkTGhDCz10v5V4v3+APlLPRo='
// }

// Callback Response:  [Object: null prototype] {
//   ORDERID: 'TEST_1598198528473',
//   MID: 'RizUXv94180712564377',
//   TXNID: '20200823111212800110168634741856283',
//   TXNAMOUNT: '1.00',
//   PAYMENTMODE: 'UPI',
//   CURRENCY: 'INR',
//   TXNDATE: '2020-08-23 21:32:09.0',
//   STATUS: 'TXN_SUCCESS',
//   RESPCODE: '01',
//   RESPMSG: 'Txn Success',
//   GATEWAYNAME: 'PPBLC',
//   BANKTXNID: '023648713577',
//   CHECKSUMHASH: 'uFE9Q28GtJ94TIB1Msgd1YOUEou4W8UBdlS2tNWmejsM+nkdARBKBiTonaXaNlIwHDeugo41IAyCeUnSwxbhhn7KKBIKXNy3HsbeZ8JhKN0='
// }
// Callback Response:  [Object: null prototype] {
//   ORDERID: 'TEST_1598198659872',
//   MID: 'RizUXv94180712564377',
//   TXNID: '20200823111212800110168152441920084',
//   TXNAMOUNT: '1.00',
//   PAYMENTMODE: 'UPI',
//   CURRENCY: 'INR',
//   TXNDATE: '2020-08-23 21:34:20.0',
//   STATUS: 'TXN_FAILURE',
//   RESPCODE: '227',
//   RESPMSG: 'Payment request was declined by payer. Please try again or use a different method to complete the payment.',
//   GATEWAYNAME: 'PPBLC',
//   BANKTXNID: '',
//   CHECKSUMHASH: 'F6aG1aeFJI6Eoh7X5WZQY72Tiq3/nFJcof8Dxpe2YXOqFvJSlr49ChD11A59mW6PCZBXFnRTbU8Pqnn9k1FjD78ssxW4Hzde6EHptcZwMz8='
// }
module.exports.callback = async (req, res) => {
  try {
    const { STATUS: txStatus, CHECKSUMHASH: checksumhash, TXNAMOUNT: amount, RESPMSG } =
      req.body || {};
    if (txStatus !== "TXN_SUCCESS") {
      throw new Error(" TXN FAILED " + RESPMSG || "--no resp--");
    }
    // verify the checksum
    const validate = checksum_lib.verifychecksum(
      req.body,
      config.PaytmConfig.key,
      checksumhash
    );
    console.log("Checksum Result => ", validate, "\n");
    if (!validate) {
      throw new Error("INVALID CHUCKSUM");
    }
    await paymentTransaction.findOneAndUpdate(
      { user: req.user, isComplete: false },
      {
        _updatedOn: new Date(),
        status: "COMPLETE",
        isComplete: true
      }
    );
    console.log("TX update");
    await User.findOneAndUpdate(
      { email: req.user.email },
      { $inc: { money: Number(amount) || 0 } }
    );
    console.log("user update");
    res.send(
      "<html><body><script>alert('PAYMENT SUCCESS');window.location.href='/wallet';</script></body></html>"
    );
    return;
  } catch (err) {
    console.log(err, "error");
    try {
      await paymentTransaction.findOneAndUpdate(
        { user: req.user, isComplete: false },
        {
          _updatedOn: new Date(),
          status: "ERROR",
          isError: true,
          isComplete: true,
          error: {
            message: err.message || err.stack || "err in module.exports.callback",
            code: err.code
          }
        }
      );
    } catch (e) {}
    res.send(paymentFailedHTML);
    return;
  }
};
