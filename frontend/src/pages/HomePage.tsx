import { useEffect, useState } from "react";

import { AuctionCard } from "@/components/AuctionCard";
import { useAppDispatch } from "@/store/store";
import { getAllAuctionsThunk } from "@/store/thunks/AuctionsThunk";
import { useCountdown } from "@/hooks/useCountdown";

import formatCountdownPL from "@/utils/formatCountdownPL";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  endDate: string; // ISO z backendu
};

export default function HomePage() {
  const dispatch = useAppDispatch();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const response = await dispatch(getAllAuctionsThunk());
      console.log(response);
      const data: Product[] = response.map((product: any) => ({
        id: String(product.id_auction),
        name: product.title,
        price: Math.round(product.current_price),
        imageUrl: product.main_photo,
        endDate: product.end_date,
      }));
      setProducts(data);
    })();
  }, []);

  const productCards = products
    .reduce((rows: any[], product, index) => {
      if (index % 5 === 0) rows.push([]);
      rows[rows.length - 1].push(product);
      return rows;
    }, [])
    .map((row, rowIndex) => (
      <div key={rowIndex} className="self-stretch inline-flex justify-start items-center gap-4">
        {row.map((product: any) => (
          <AuctionCard key={product.id} product={product} />
        ))}
      </div>
    ));

  return (
    <div className="self-stretch py-16 inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden">
      <div className="w-full max-w-[1400px] p-4 bg-zinc-100 flex flex-col justify-start items-start gap-8 overflow-hidden">
        {productCards}
      </div>
    </div>
  );
}
