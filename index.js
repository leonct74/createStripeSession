

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
};