import { NewsItem } from './news-item-interface';
import { Offer } from './offer-interface';

export interface User {
  $key: string,
  balance: number;
  createdAt: number;
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  log: Array<NewsItem>;
  pushID: string;
  offers: Array<Offer>;
  profilePicURL: string;
  type: string;
}
