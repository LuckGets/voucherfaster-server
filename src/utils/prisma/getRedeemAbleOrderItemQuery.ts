export const getRedeemAbleOrderItemRawQuery: string = `
SELECT odit.id as order_item_id
FROM "order_item" odit
JOIN "order" od ON odit."order_id" = od."id"
JOIN "usable_days_after_purchased" udap ON od."usable_days_after_purchased_id" = udap."id"
JOIN "transaction" tr ON tr."order_id" = od."id"
LEFT JOIN "redeemed_order_item" rodit ON rodit."order_item_id" = odit."id"
WHERE rodit."id" IS NULL
 AND (
     od."created_at" + (udap."usable_days" || ' days')::interval
 ) <= CURRENT_TIMESTAMP
AND
    tr."status" = 'SUCCESS'
`;

// -- name: getRedeemAbleOrderItem and build json.
// export const getRedeemAbleOrderItemRawQuery: string = `
// SELECT json_build_object(
//   'id', odit.id,
//   'orderId', odit.order_id,
//   'qrcodeImgPath', odit.qrcode_img_path,
//   'code', odit.code,
//   'order', json_build_object(
//     'id', od.id,
//     'createdAt', od.created_at,
//     'usableDaysAfterPurchasedId', od.usable_days_after_purchased_id,
//     'accountId', od.account_id,
//     'totalPrice', od.total_price,
//     /* ... all the fields you want nested ... */
//     'usableDaysAfterPurchased', json_build_object(
//       'id', udap.id,
//       'usableDays', udap.usable_days
//     )
//   ),
//   'RedeemOrderItem', COALESCE(json_agg(rodit.*), '[]')
//   /* ... any other relationships ... */
// ) AS "nestedItem"
// FROM "order_item" odit
// JOIN "order" od
//   ON odit.order_id = od.id
// JOIN "usable_days_after_purchased" udap
//   ON od.usable_days_after_purchased_id = udap.id
// LEFT JOIN "redeemed_order_item" rodit
//   ON rodit.order_item_id = odit.id
// WHERE rodit.id IS NULL
//   AND (
//     od.created_at + (udap.usable_days || ' days')::interval
//   ) <= CURRENT_TIMESTAMP
// GROUP BY odit.id, od.id, udap.id
// `;
