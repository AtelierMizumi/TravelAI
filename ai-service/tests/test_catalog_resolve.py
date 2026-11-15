"""Google web candidates are matched to the catalog by exact landmark names, never by fuzzy text."""
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).parents[1]))

from ai.catalog_resolve import resolve_catalog
from ai.landmark_model import LANDMARKS


def cand(name, score, source="web"):
    return {"name": name, "rankingScore": score, "source": source}


class CatalogResolveTest(unittest.TestCase):
    def best(self, *candidates):
        found = resolve_catalog(list(candidates), LANDMARKS)
        return found["best"]["code"] if found["best"] else None

    def test_top_web_candidate_resolves_to_the_catalog_landmark(self):
        self.assertEqual("cho_ben_thanh", self.best(cand("Ben Thanh Market", 1.246), cand("Clock tower", .55)))

    def test_match_behind_generic_candidates_still_resolves(self):
        self.assertEqual("cho_ben_thanh", self.best(cand("Supermarket", 1.162), cand("Ben Thanh Market", .749)))

    def test_vietnamese_and_english_names_with_diacritics_and_case(self):
        for name, code in [("Chợ Bến Thành", "cho_ben_thanh"), ("Temple Of Literature", "van_mieu"),
                           ("Mausoleum of Emperor Khai Dinh", "lang_khai_dinh"), ("Meridian Gate", "ngo_mon_hue"),
                           ("Linh Ung pagoda", "chua_linh_ung"), ("Hoàn Kiếm Lake", "ho_hoan_kiem"),
                           ("Notre Dame Cathedral of Saigon", "nha_tho_duc_ba"), ("Golden Bridge", "cau_vang")]:
            self.assertEqual(code, self.best(cand(name, .9)), name)

    def test_a_region_name_is_not_a_landmark_name(self):
        # Google labels the Dragon Bridge photo "Ba Na Hills": the area must not become the Golden Bridge.
        self.assertIsNone(self.best(cand("Ba Na Hills", 1.092), cand("Hội An", .646), cand("Da Nang", .5)))

    def test_a_two_word_name_that_is_also_a_common_phrase_is_not_enough(self):
        # Google returned "My Son" for a Hội An bridge photo; only the full sanctuary name is specific.
        self.assertIsNone(self.best(cand("My Son", .611), cand("Hội An", .85)))
        self.assertEqual("thanh_dia_my_son", self.best(cand("My Son Sanctuary", .8)))
        self.assertEqual("thanh_dia_my_son", self.best(cand("Thánh địa Mỹ Sơn", .8)))

    def test_matching_is_exact_not_fuzzy(self):
        self.assertIsNone(self.best(cand("Ben Thanh Market Street Food Tour Saigon", 1.5), cand("Market", 1.2)))

    def test_weak_evidence_is_ignored(self):
        self.assertIsNone(self.best(cand("Ben Thanh Market", .2)))

    def test_clear_winner_among_two_landmarks_is_kept(self):
        found = resolve_catalog([cand("Golden Bridge", 1.032), cand("Dragon Bridge", .892)], LANDMARKS)
        self.assertEqual("cau_vang", found["best"]["code"])
        self.assertEqual(["cau_vang", "cau_rong"], [m["code"] for m in found["matches"]])

    def test_a_near_tie_is_not_decided_but_both_are_offered(self):
        found = resolve_catalog([cand("Golden Bridge", 1.0), cand("Dragon Bridge", .96)], LANDMARKS)
        self.assertIsNone(found["best"])
        self.assertEqual({"cau_vang", "cau_rong"}, {m["code"] for m in found["matches"]})

    def test_one_landmark_named_twice_counts_once_with_its_best_score(self):
        found = resolve_catalog([cand("Golden Bridge", .8), cand("Cầu Vàng", .95)], LANDMARKS)
        self.assertEqual(1, len(found["matches"]))
        self.assertEqual(.95, found["matches"][0]["score"])

    def test_no_candidates(self):
        self.assertEqual({"best": None, "matches": []}, resolve_catalog([], LANDMARKS))


if __name__ == "__main__":
    unittest.main()
