export interface Offer {
  location: Array<number>;
  picURL: string;
  price: number;
  priceDescription: string;
  seller: string;
  sellerName: string; //todo: do this in template
  timestamp: number;
  title: string;
}
