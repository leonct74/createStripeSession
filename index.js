

module.exports = function (
  businessModelObj,
  customer,
  domain,
  hasUserSelectedHomeDel,
  itemsList,
  orderId,
  salesOrder,
  stripe_acc,
  updSalesOrder,
) {

  // Maps any Extras to Stripe checkout
  const line_items = await salesOrder.cartItems.map((item) => {
    let extras = [];
    if(item.extras.length > 0) {
      extras = item.extras.map((ex) => {
        return ` +${ex.titleExtras}`;
      });
    }

    let cart = {
      name: `${item.title} ${extras.length > 0 ? extras : ""}`,
      amount: parseInt(item.price),
      currency: item.currency,
      quantity: item.qty,
    };

    return cart;
  });

  // Check if HomeDelivery and eventually add delivery to the cart
  if (hasUserSelectedHomeDel) {
    line_items.push({
      name: "Home-delivery fee",
      amount: businessModelObj.deliveryFee,
      currency: salesOrder.cartItems[0].currency,
      quantity: 1,
    });
  }

  // console.log("NEW line_items ARRAY: ", line_items)

  // SAVE CREDIT-CARD ORDER AND NOTIFY
  const sessionData = {
    amount: updSalesOrder.amount, // Needed to calculate platform fee
    sellerId: itemsList[0].sellerId,
    customer_email: customer.email,
    line_items: await line_items,
    domain,
    orderId,
    stripe_account: stripe_acc,
  };

  console.log("NEW SESSION sessionData IS: ", sessionData)

  return sessionData

  // try{
  // // 1. Creates Stripe checkout Session
  //   const newCheckOut = await API.post("OrdersApi", "/order", {
  //     body: sessionData,
  //   });
  //   console.log("NEW CHECKOUT SESSION : ", newCheckOut);

  //   /* 2. Save a Temporary ShipmentOrder
  //    I could send order details to session using payment_intent_data.metadata, but it is not reccomended to send customer sensitive data */

  //   const tempOrderBody = {
  //     ...updSalesOrder,
  //     paymentStatus:"un-authorized",
  //     paymentId:1,
  //     payment_intent: newCheckOut.payment_intent,
  //     status: "temporary order",
  //     statusId: 10,
  //     stripe_account: stripe_acc, // needed only for Ideal-flow
  //     stripe_source: null, // needed only for Ideal-flow
  //   };

  //   const shipmentOrderBody = {...tempOrderBody};
  //   delete shipmentOrderBody.date;
  //   delete shipmentOrderBody.companyName;

  //   const result = await API.graphql(
  //     graphqlOperation(queries.createTempOrder, {input: shipmentOrderBody})
  //   );

  //   /* --  RE-DIRECT AFTER STRIPE CHECKOUT  -------- */
  //   var SS = window.Stripe(config.stripePublishableKey.dev, {
  //     stripeAccount: stripe_acc
  //   });

  //   SS.redirectToCheckout({
  //     sessionId: await newCheckOut.id,
  //   }).then(function (result) {
  //   // If `redirectToCheckout` fails due to a browser or network
  //   // error, display the localized error message to your customer
  //   // using `result.error.message`.
  //   //console.log("STRIPE result: ", result);
  //     if(!result.error) {
  //       emptyCart();
  //     }
      
  //   });
  // } catch(e) {
  //   console.log("STRIPE CHECKOUT FAILED TO GET SESSION ID: ", e);
  // }
};