using my.star1 as my from '../db/schema';

service CatalogService {
   entity Star as projection on my.Star;
}
