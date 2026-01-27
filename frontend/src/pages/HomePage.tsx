import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";

import { AuctionCard } from "@/components/AuctionCard";
import { getAllAuctionsThunk } from "@/store/thunks/AuctionsThunk";
import { useCountdown } from "@/hooks/useCountdown";

import formatCountdownPL from "@/utils/formatCountdownPL";
import { CategoryItem } from "@/components/CategoryItem";
import { selectUnsoldFilteredAuctionsBySearchAndCategory } from "@/store/slices/auctionSlice";

import { getAuctionCategoriesThunk } from "@/store/thunks/AuctionsThunk";
import {
  selectCategories,
  selectSelectedCategoryId,
  selectSelectedCategory,
  setSelectedCategoryId,
} from "@/store/slices/categoriesSlice";
import { setCategories } from "@/store/slices/categoriesSlice";

export default function HomePage() {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectUnsoldFilteredAuctionsBySearchAndCategory);
  const categoryItems = useAppSelector(selectCategories);
  const selectedItems = useAppSelector(selectSelectedCategory);
  console.log(selectedItems);

  useEffect(() => {
    const load = async () => {
      const categories = await dispatch<any>(getAuctionCategoriesThunk());
      dispatch(setCategories(categories));
    };
    load();
  }, [dispatch]);

  const productCards = products
    .reduce((rows: any[], product, index) => {
      if (index % 5 === 0) rows.push([]);
      rows[rows.length - 1].push(product);
      return rows;
    }, [])
    .map((row, rowIndex) => (
      <div key={rowIndex} className="self-stretch h-full inline-flex justify-start items-streach">
        {row.map((product: any) => (
          <AuctionCard key={String(product.id_auction)} product={product} />
        ))}
      </div>
    ));

  // const [selectedItems, setSelectedItems] = useState<Array<string>>([]); // TODO obsłużyć logikę listy

  return (
    <div className="self-stretch py-16 flex-col justify-start items-center gap-8 overflow-hidden">
      <div className="w-full max-w-[1400px] gap-4">
        {categoryItems.map((category) => (
          <CategoryItem
            key={category.id_category}
            label={category.category_name}
            id_category={category.id_category}
            onClick={() => {
              dispatch(setSelectedCategoryId(category.id_category));
            }}
            selectedItems={selectedItems?.id_category}
          />
        ))}
      </div>
      <div className="w-full max-w-[1400px] bg-zinc-100 flex flex-col justify-start items-start overflow-hidden p-2">
        {productCards}
      </div>
    </div>
  );
}