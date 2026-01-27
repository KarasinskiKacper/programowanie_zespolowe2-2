import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";

import { AuctionCard } from "@/components/AuctionCard";
import { getAllAuctionsThunk } from "@/store/thunks/AuctionsThunk";
import { useCountdown } from "@/hooks/useCountdown";

import formatCountdownPL from "@/utils/formatCountdownPL";
import { CategoryItem } from "@/components/CategoryItem";
import {
  setAuctions,
  selectAllAuctions,
  selectUnsoldAuctions,
  selectSearch,
  selectFilteredAuctionsBySearch,
  selectUnsoldFilteredAuctionsBySearch,
} from "@/store/slices/auctionSlice";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  endDate: string;
};

export default function HomePage() {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectUnsoldFilteredAuctionsBySearch);

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

  const categoryItems = ["RTV/AGD", "Elektronika", "Dom", "Auto", "Dzieci"]; // TODO dostarczyć listę kategiorii ze state
  const [selectedItems, setSelectedItems] = useState<Array<string>>([]); // TODO obsłużyć logikę listy

  return (
    <div className="self-stretch py-16 flex-col justify-start items-center gap-8 overflow-hidden">
      <div className="w-full max-w-[1400px] gap-4">
        {categoryItems.map((category) => (
          <CategoryItem
            key={category}
            label={category}
            onClick={() => {
              if (selectedItems.includes(category))
                setSelectedItems(selectedItems.filter((item) => item != category));
              else setSelectedItems([...selectedItems, category]);
            }}
            selectedItems={selectedItems}
          />
        ))}
      </div>
      <div className="w-full max-w-[1400px] bg-zinc-100 flex flex-col justify-start items-start overflow-hidden p-2">
        {productCards}
      </div>
    </div>
  );
}