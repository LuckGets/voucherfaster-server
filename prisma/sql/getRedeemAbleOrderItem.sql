-- name: getRedeemAbleOrderItem
SELECT odit.*
FROM order_item odit
--JOIN the order table to retrieve created_at field.
JOIN "order" od ON odit.order_id = od.id 
-- JOIN usable_days_after_purchased to retrieve usable days
JOIN usable_days_after_purchased udap ON od.usable_days_after_purchased_id = udap.id
-- LEFT JOIN on redeemed_order_item so if no redeem_order_item row is found, it will be null
LEFT JOIN redeemed_order_item rodit ON rodit.order_item_id = odit.id
-- AND we **DON'T** want to find any redeemed_order_item.id to have value
-- as it will translate to the order_item was used.
WHERE rodit.id IS NULL
-- -- The next part is where we will calculate the 
-- usable days which we can find by sum the usableDays of each order
-- with it created_at day
-- if it's more than currentDate than it won't meet the criteria
AND (
    od.created_at + (udap.usable_days || ' days')::interval
) <= CURRENT_TIMESTAMP
