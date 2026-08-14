export type EventNotificationMessageOrder = {
  catalog_id: string;
  text?: string;
  product_items: Array<{
    product_retailer_id: string;
    quantity: number;
    item_price: number;
    currency: string;
  }>;
};
