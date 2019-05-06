const fs = require('fs');
const env = require('dotenv');

if (fs.existsSync('.env')) {
  process.env = Object.assign(env.load().parsed, process.env);
}

const apiRequests = {
  hotpepper: "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/",
  gnavi: "https://api.gnavi.co.jp/RestSearchAPI/20150630/",
  google_place: "https://maps.googleapis.com/maps/api/place/",
  yelp: "https://api.yelp.com/v3/businesses/search"
};

export default class Restaurant {
  constructor() {}

  async requestHotpepper(searchObj = {}) {
    const request_params = {
      format: "json",
      key: process.env.RECRUIT_APIKEY,
      datum: "world",
      count: 100
    }
    if (searchObj.latitude && searchObj.longitude) {
      request_params.range = searchObj.range;
      request_params.lat = searchObj.latitude;
      request_params.lng = searchObj.longitude;
    }
    if (searchObj.keyword) {
      request_params.keyword = searchObj.keyword;
    }
    const response = await axios.get(apiRequests.hotpepper, {
      params: request_params,
    });
    return response.data;
  }

  async requestGnavi(searchObj = {}) {
    const request_params = {
      //      range: 3,
      format: "json",
      keyid: process.env.GNAVI_APIKEY,
      coordinates_mode: 2,
      hit_per_page: 100
      //offset: 1,
      //no_smoking: 1,
      //mobilephone: 1,
      //parking: 1,
      //deliverly 1 デリバリーあり
      //special_holiday_lunch: 1 土日特別ランチあり 0
      //breakfast: 1
      //until_morning: 1
    };
    //  if (7..10).cover?(now.hour)
    //  #朝食をやっているか
    //  request_hash[:breakfast] = 1
    //elsif (14..16).cover?(now.hour)
    //  #遅めのランチをやっているか
    //  request_hash[:late_lunch] = 1
    //elsif (3..5).cover?(now.hour)
    //  #朝までやっているか
    //  request_hash[:until_morning] = 1
    //end
    if (searchObj.latitude && searchObj.longitude) {
      // 世界測地系
      request_params.input_coordinates_mode = 2;
      request_params.range = searchObj.range;
      request_params.latitude = searchObj.latitude;
      request_params.longitude = searchObj.longitude;
    }
    if (searchObj.keyword) {
      request_params.freeword = searchObj.keyword;
    }
    const response = await axios.get(apiRequests.gnavi, {
      params: request_params,
    });
    return response.data;
  }

  async requestGooglePlace(searchObj = {}) {
    if (!searchObj.latitude || !searchObj.longitude) {
      return {};
    }
    const request_params = {
      key: process.env.GOOGLE_APIKEY,
      location: [searchObj.latitude, searchObj.longitude].join(","),
      // 半径(メートル)
      radius: 500,
      // 絞り込む施設種別。convenience_store,department_store,shopping_mall,store  は一旦stay
      types: "bakery|cafe|restaurant|meal_delivery|meal_takeaway"
    };
    // apiRequests.google_place + "nearbysearch/json"
    // apiRequests.google_place + "radarsearch/json"
    // radarsearchの場合 {"geometry":{"location":{"lat":35.6654288,"lng":139.7313736}},"id":"adec56633b11850885e6eb192bfcac05670c16c5","place_id":"ChIJHU98fXiLGGARFVo98cPvr8U","reference":"CmRSAAAApQbyfeCmn_slXfULoEWSbD33q3Yuy7LTqVsRKAZ7KB6wz6477HQp5C9qNrfvXnC-nnIg7CGH9aJC41NQQvm7ePlDAf_02Jf3IC-4Xn-8Vphcfj7PWneKuR_bq3dEPQqTEhDSeisK-y-6cwbvJ7Ix7HaFGhRIwfoMfM08U6GdCNJjsXwpUBYQtA"}
    const response = await axios.get(apiRequests.google_place + "nearbysearch/json", {
      params: request_params,
    });
    return response.data;
  }

  async requestYelp(searchObj = {}) {
    if (!searchObj.latitude || !searchObj.longitude) {
      return {};
    }
    const request_params = {
      latitude: searchObj.latitude,
      longitude: searchObj.longitude,
      // 半径(メートル)
      radius: 500,
      limit: 50
    };
    const response = await axios.get(apiRequests.yelp, {
      params: request_params,
      headers: {
        "Authorization": ["Bearer", process.env.YELP_APIKEY].join(" ")
      },
    });
    return response.data;
  }

  //range	検索範囲	ある地点からの範囲内のお店の検索を行う場合の範囲を5段階で指定できます。たとえば300m以内の検索ならrange=1を指定します	1: 300m
  //2: 500m
  //3: 1000m (初期値)
  //4: 2000m
  //5: 3000m
  //携帯クーポン掲載	携帯クーポンの有無で絞り込み条件を指定します。		1：携帯クーポンなし
  //0：携帯クーポンあり
  //指定なし：絞り込みなし
  //lunch	ランチあり	「ランチあり」という条件で絞り込むかどうかを指定します。	 	0:絞り込まない（初期値）
  //1:絞り込む
  //midnight	23時以降も営業	「23時以降も営業」という条件で絞り込むかどうかを指定します。	 	0:絞り込まない（初期値）
  //1:絞り込む
  //midnight_meal	23時以降食事OK	「23時以降食事OK」という条件で絞り込むかどうかを指定します。	 	0:絞り込まない（初期値）
  //1:絞り込む
  //    count	1ページあたりの取得数	検索結果の最大出力データ数を指定します。	 	初期値：10、最小1、最大100
  //format	レスポンス形式	レスポンスをXMLかJSONかJSONPかを指定します。JSONPの場合、さらにパラメータ callback=コールバック関数名 を指定する事により、javascript側コールバック関数の名前を指定できます。	 	初期値:xml。xml または json または jsonp。
  //genre	お店ジャンルコード	お店のジャンル(サブジャンル含む)で絞込むことができます。指定できるコードについてはジャンルマスタAPI参照	 	*2
  //food	料理コード	料理（料理サブを含む)で絞りこむことができます。指定できるコードについては料理マスタAPI参照	 	5個まで指定可。*2
  //budget	検索用予算コード	予算で絞り込むことができます。指定できるコードについては予算マスタAPI参照	 	2個まで指定可。*2

  convertToRestaurantsFromGnaviShop(shop) {
    return {
      id: "gnavi_" + shop.id,
      orginal_id: shop.id,
      latitude: shop.latitude,
      longitude: shop.longitude,
      address: shop.address,
      name: shop.name,
      description: shop.pr.pr_long || shop.pr.pr_short,
      url: shop.url_mobile || shop.url,
      phone_number: shop.tel || shop.tel_sub,
      icon_url: shop.image_url.shop_image1 || shop.image_url.shop_image2,
      coupon_url: shop.coupon_url.mobile || shop.coupon_url.pc,
      opentime: shop.opentime,
      holiday: shop.holiday,
    };
  }

  convertToRestaurantsFromHotpepperShop(shop) {
    return {
      id: "hotpepper_" + shop.id,
      orginal_id: shop.id,
      latitude: shop.lat,
      longitude: shop.lng,
      address: shop.address,
      name: shop.name,
      description: shop.catch,
      url: shop.urls.pc,
      phone_number: null,
      icon_url: shop.photo.mobile.l || shop.photo.mobile.s || shop.photo.pc.l || shop.photo.pc.m || shops[i].photo.pc.s,
      coupon_url: shop.coupon_urls.sp || shop.coupon_urls.pc,
      opentime: shop.open,
      holiday: shop.close,
    };
  }

  async searchRestaurant(lineMessageObj) {
    const restaurants = [];
    if (lineMessageObj.message.type == "location") {
      const gnaviResponse = await this.requestGnavi(searchObj);
      for (const shop of gnaviResponse.body.rest) {
        restaurants.push(this.convertToRestaurantsFromGnaviShop(shop));
      }

      const hotpepperResponse = await this.requestHotpepper(searchObj);
      for (const shop of hotpepperResponse.body.results.shop) {
        restaurants.push(this.convertToRestaurantsFromHotpepperShop(shop));
      }
    }
    return restaurants;
  }
}