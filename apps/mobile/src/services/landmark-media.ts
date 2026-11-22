import { Platform } from "react-native";
import type { Place } from "./types";
// Verified Wikimedia catalogue photos. Native requires bundle the assets for offline use.
// Only photos that exist in the repository are bundled; other landmarks fall back to the backend image URL.
const bundled: Record<string, number> = {
  cau_long_bien: require("../../public/images/landmarks/cau_long_bien.jpg"),
  cau_rong: require("../../public/images/landmarks/cau_rong.jpg"),
  cau_vang: require("../../public/images/landmarks/cau_vang.jpg"),
  cho_ben_thanh: require("../../public/images/landmarks/cho_ben_thanh.jpg"),
};
const credits: Record<string, { url: string; source: string; text: string }> = {
  "cau_long_bien": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Long_bien_bridge.jpg/960px-Long_bien_bridge.jpg?utm_source=vi.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Long_bien_bridge.jpg",
    "text": "Pierre De Hanscutter · CC BY-SA 3.0"
  },
  "cau_rong": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Dragon_Bridge%2C_Da_Nang_during_day_-_20230819_%28cropped%29.jpg/960px-Dragon_Bridge%2C_Da_Nang_during_day_-_20230819_%28cropped%29.jpg?utm_source=vi.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Dragon_Bridge,_Da_Nang_during_day_-_20230819_(cropped).jpg",
    "text": "Somerset999 · CC BY-SA 4.0"
  },
  "cau_vang": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/The_Golden_Bridge%2C_Ba_Na_Hills%2C_Vietnam.jpg/960px-The_Golden_Bridge%2C_Ba_Na_Hills%2C_Vietnam.jpg?utm_source=vi.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:The_Golden_Bridge,_Ba_Na_Hills,_Vietnam.jpg",
    "text": ". Ray in Manila · CC BY 2.0"
  },
  "cho_ben_thanh": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Ben_Thanh_market_2.jpg/960px-Ben_Thanh_market_2.jpg?utm_source=vi.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Ben_Thanh_market_2.jpg",
    "text": "Riza · CC BY 2.0"
  },
  "chua_cau_hoi_an": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Cau_Nhat_Ban.jpg/960px-Cau_Nhat_Ban.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Cau_Nhat_Ban.jpg",
    "text": "User dalbera on Flickr · CC BY 1.0"
  },
  "chua_mot_cot": {
    "url": "https://upload.wikimedia.org/wikipedia/commons/9/90/One_Pillar_Pagoda_Hanoi.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "source": "https://commons.wikimedia.org/wiki/File:One_Pillar_Pagoda_Hanoi.jpg",
    "text": "Staffan Scherz · CC BY 2.0"
  },
  "chua_tran_quoc": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Ch%C3%B9a_Tr%E1%BA%A5n_Qu%E1%BB%91c%2C_H%C3%A0_N%E1%BB%99i.jpg/960px-Ch%C3%B9a_Tr%E1%BA%A5n_Qu%E1%BB%91c%2C_H%C3%A0_N%E1%BB%99i.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Ch%C3%B9a_Tr%E1%BA%A5n_Qu%E1%BB%91c,_H%C3%A0_N%E1%BB%99i.jpg",
    "text": "Thang Nguyen · CC BY-SA 2.0"
  },
  "dinh_doc_lap": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Dinh_%C4%90%E1%BB%99c_L%E1%BA%ADp_v%C3%A0o_n%C3%A0m_2024.jpg/960px-Dinh_%C4%90%E1%BB%99c_L%E1%BA%ADp_v%C3%A0o_n%C3%A0m_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Dinh_%C4%90%E1%BB%99c_L%E1%BA%ADp_v%C3%A0o_n%C3%A0m_2024.jpg",
    "text": "Yesvn123 · CC BY-SA 4.0"
  },
  "ho_hoan_kiem": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Hoan_Kiem_10082026.jpg/960px-Hoan_Kiem_10082026.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Hoan_Kiem_10082026.jpg",
    "text": "Chuhai07 · CC0"
  },
  "lang_khai_dinh": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/L%C4%83ng_Kh%E1%BA%A3i_%C4%90%E1%BB%8Bnh_-_NKS.jpg/960px-L%C4%83ng_Kh%E1%BA%A3i_%C4%90%E1%BB%8Bnh_-_NKS.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:L%C4%83ng_Kh%E1%BA%A3i_%C4%90%E1%BB%8Bnh_-_NKS.jpg",
    "text": "NKSTTSSHNVN · CC BY-SA 4.0"
  },
  "lang_tu_duc": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Annam_-_Hu%C3%A9_-_Pavillons_sur_le_bassin_fleuri_au_Tombeau_de_Tu-Duc.jpg/960px-Annam_-_Hu%C3%A9_-_Pavillons_sur_le_bassin_fleuri_au_Tombeau_de_Tu-Duc.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Annam_-_Hu%C3%A9_-_Pavillons_sur_le_bassin_fleuri_au_Tombeau_de_Tu-Duc.jpg",
    "text": "Unknown authorUnknown author · Public domain"
  },
  "ngu_hanh_son": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Ngu_hanh_son_toan_canh.jpg/960px-Ngu_hanh_son_toan_canh.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Ngu_hanh_son_toan_canh.jpg",
    "text": "Viethavvh at vi.wikipedia · Public domain"
  },
  "nha_tho_duc_ba": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Bas%C3%ADlica_de_Nuestra_Se%C3%B1ora%2C_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_05.JPG/960px-Bas%C3%ADlica_de_Nuestra_Se%C3%B1ora%2C_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_05.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:Bas%C3%ADlica_de_Nuestra_Se%C3%B1ora,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_05.JPG",
    "text": "Diego Delso · CC BY-SA 3.0"
  },
  "thanh_dia_my_son": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/2024_-_M%E1%BB%B9_S%C6%A1n_Group_B%2C_C_and_D_-_img_23.jpg/960px-2024_-_M%E1%BB%B9_S%C6%A1n_Group_B%2C_C_and_D_-_img_23.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "source": "https://commons.wikimedia.org/wiki/File:2024_-_M%E1%BB%B9_S%C6%A1n_Group_B,_C_and_D_-_img_23.jpg",
    "text": "Chainwit. · CC BY 4.0"
  }
};
function catalogPhoto(place: Pick<Place, "landmarkCode" | "imageUrl">) {
  const code = place.landmarkCode || "", credit = credits[code];
  const isCatalogDefault = !place.imageUrl || place.imageUrl === credit?.url || place.imageUrl.startsWith("https://images.unsplash.com/");
  return credit && bundled[code] && isCatalogDefault ? { code, credit } : null;
}
export function landmarkImage(place: Pick<Place, "landmarkCode" | "imageUrl">) {
  const photo = catalogPhoto(place);
  if (photo) return Platform.OS === "web" ? { uri: `/images/landmarks/${photo.code}.jpg` } : bundled[photo.code];
  return { uri: place.imageUrl || "" };
}
export function landmarkCredit(place: Pick<Place, "landmarkCode" | "imageUrl">) {
  return catalogPhoto(place)?.credit;
}
