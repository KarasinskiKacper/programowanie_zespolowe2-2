import { useEffect, useState } from "react";

import { AuctionCard } from "@/components/AuctionCard";
import { useAppDispatch } from "@/store/store";
import { getAllAuctionsThunk } from "@/store/thunks/AuctionsThunk";
import { useCountdown } from "@/hooks/useCountdown";

import formatCountdownPL from "@/utils/formatCountdownPL";
import { CategoryItem } from "@/components/CategoryItem";

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
      console.log("home", data);
      
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
      <div key={rowIndex} className="self-stretch h-full inline-flex justify-start items-streach">
        {row.map((product: any) => (
          <AuctionCard key={product.id} product={product} />
        ))}
      </div>
    ));
  
  const categoryItems = ["RTV/AGD", "Elektronika", "Dom", "Auto", "Dzieci"] // TODO dostarczyć listę kategiorii ze state
  const [selectedItems, setSelectedItems] = useState<Array<string>>([]) // TODO obsłużyć logikę listy

  return (
    <div className="self-stretch py-16 flex-col justify-start items-center gap-8 overflow-hidden">
      <div className="w-full max-w-[1400px] gap-4">
        {categoryItems.map(category => <CategoryItem 
          label={category}
          onClick={()=>{
            if(selectedItems.includes(category)) setSelectedItems(selectedItems.filter(item => item != category));
            else setSelectedItems([...selectedItems, category])
          }}
          selectedItems={selectedItems}
        />)}
      </div>
      <div className="w-full max-w-[1400px] bg-zinc-100 flex flex-col justify-start items-start overflow-hidden p-2">
        {productCards}
      </div>
    </div>
  );
}