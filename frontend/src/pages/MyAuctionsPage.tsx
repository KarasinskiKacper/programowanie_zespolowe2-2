import { useState, useEffect } from "react";

import { AuctionCard } from "@/components/AuctionCard";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  getUserOwnAuctionsThunk,
  getUserAuctionsThunk,
  getArchiveAuctionsThunk,
} from "@/store/thunks/AuctionsThunk";
import { selectSearch } from "@/store/slices/auctionSlice";
import {
  setOwnAuctions,
  setParticipatingAuctions,
  setArchivedAuctions,
  selectOwnAuctions,
  selectParticipatingAuctions,
  selectArchivedAuctions,
} from "@/store/slices/userAuctionSlice";

import { handleAutoLoginWithRerouteToLoginPage } from "@/components/AutoLoginHandler";

const myAuctionsPlaceholder = [
  {
    id: "1",
    name: "Ekspres ciśnieniowy DeLonghi Magnifica Start ECAM220.80.SB 1450W",
    price: 1999,
    imageUrl: "",
    time: "2 dni 4 godz",
  },
  {
    id: "2",
    name: "Smartfon Samsung Galaxy S21 FE 5G 128GB Czarny",
    price: 2399,
    imageUrl: "",
    time: "5 dni 1 godz",
  },
  {
    id: "3",
    name: "Laptop Apple MacBook Air 13 M1 8GB/256GB SSD Silver",
    price: 4299,
    imageUrl: "",
    time: "1 dzień 12 godz",
  },
  {
    id: "4",
    name: "Smartfon Samsung Galaxy S21 FE 5G 128GB Czarny",
    price: 2399,
    imageUrl: "",
    time: "5 dni 1 godz",
  },
  {
    id: "5",
    name: "Laptop Apple MacBook Air 13 M1 8GB/256GB SSD Silver",
    price: 4299,
    imageUrl: "",
    time: "1 dzień 12 godz",
  },
];
const participantAuctionsPlaceholder = [
  {
    id: "1",
    name: "Ekspres ciśnieniowy DeLonghi Magnifica Start ECAM220.80.SB 1450W",
    price: 1999,
    imageUrl: "",
    time: "2 dni 4 godz",
  },
  {
    id: "2",
    name: "Smartfon Samsung Galaxy S21 FE 5G 128GB Czarny",
    price: 2399,
    imageUrl: "",
    time: "5 dni 1 godz",
  },
  {
    id: "3",
    name: "Laptop Apple MacBook Air 13 M1 8GB/256GB SSD Silver",
    price: 4299,
    imageUrl: "",
    time: "1 dzień 12 godz",
  },
  {
    id: "4",
    name: "Smartfon Samsung Galaxy S21 FE 5G 128GB Czarny",
    price: 2399,
    imageUrl: "",
    time: "5 dni 1 godz",
  },
  {
    id: "5",
    name: "Laptop Apple MacBook Air 13 M1 8GB/256GB SSD Silver",
    price: 4299,
    imageUrl: "",
    time: "1 dzień 12 godz",
  },
];
const archiveAuctionsPlaceholder = [
  {
    id: "1",
    name: "Ekspres ciśnieniowy DeLonghi Magnifica Start ECAM220.80.SB 1450W",
    price: 1999,
    imageUrl: "",
    time: "2 dni 4 godz",
  },
  {
    id: "2",
    name: "Smartfon Samsung Galaxy S21 FE 5G 128GB Czarny",
    price: 2399,
    imageUrl: "",
    time: "5 dni 1 godz",
  },
  {
    id: "3",
    name: "Laptop Apple MacBook Air 13 M1 8GB/256GB SSD Silver",
    price: 4299,
    imageUrl: "",
    time: "1 dzień 12 godz",
  },
  {
    id: "4",
    name: "Smartfon Samsung Galaxy S21 FE 5G 128GB Czarny",
    price: 2399,
    imageUrl: "",
    time: "5 dni 1 godz",
  },
  {
    id: "5",
    name: "Laptop Apple MacBook Air 13 M1 8GB/256GB SSD Silver",
    price: 4299,
    imageUrl: "",
    time: "1 dzień 12 godz",
  },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  handleAutoLoginWithRerouteToLoginPage();

  const search = useAppSelector(selectSearch);
  const myAuctions = useAppSelector(selectOwnAuctions);
  const participantAuctions = useAppSelector(selectParticipatingAuctions);
  const archiveAuctions = useAppSelector(selectArchivedAuctions);

  const matchesSearch = (title: string, q: string) =>
    title.toLowerCase().includes(q.trim().toLowerCase());

  const q = search.trim().toLowerCase();

  const myAuctionsFiltered = q
    ? myAuctions.filter((a: any) => matchesSearch(a.title ?? "", q))
    : myAuctions;

  const participantAuctionsFiltered = q
    ? participantAuctions.filter((a: any) => matchesSearch(a.title ?? "", q))
    : participantAuctions;

  const archiveAuctionsFiltered = q
    ? archiveAuctions.filter((a: any) => matchesSearch(a.title ?? "", q))
    : archiveAuctions;


  const productCards1 = myAuctionsFiltered
    .reduce((rows: any[], product, index) => {
      if (index % 5 === 0) rows.push([]);
      rows[rows.length - 1].push(product);
      return rows;
    }, [])
    ?.map((row, rowIndex) => (
      <div key={rowIndex} className="self-stretch inline-flex justify-start items-streach">
        {row.map((product: any) => (
          <AuctionCard key={String(product.id_auction)} product={product} />
        ))}
      </div>
    ));

  const productCards2 = participantAuctionsFiltered
    .reduce((rows: any[], product, index) => {
      if (index % 5 === 0) rows.push([]);
      rows[rows.length - 1].push(product);
      return rows;
    }, [])
    ?.map((row, rowIndex) => (
      <div key={rowIndex} className="self-stretch inline-flex justify-start items-streach">
        {row.map((product: any) => (
          <AuctionCard key={String(product.id_auction)} product={product} />
        ))}
      </div>
    ));

  const productCards3 = archiveAuctionsFiltered
    .reduce((rows: any[], product, index) => {
      if (index % 5 === 0) rows.push([]);
      rows[rows.length - 1].push(product);
      return rows;
    }, [])
    ?.map((row, rowIndex) => (
      <div key={rowIndex} className="self-stretch inline-flex justify-start items-streach">
        {row.map((product: any) => (
          <AuctionCard key={String(product.id_auction)} product={product} />
        ))}
      </div>
    ));

  return (
    <div className="self-stretch py-16 inline-flex flex-col justify-start items-center gap-16 overflow-hidden">
      <Products
        label="Moje aukcje"
        emptyLabel="Obecnie nie prowadzisz żadnych aukcji"
        productsCards={productCards1}
      />
      <Products
        label="Aukcje w których biorę udział"
        emptyLabel="Obecnie nie bierzesz udziału w żadnych aukcjach"
        productsCards={productCards2}
      />
      <Products
        label="Archiwum"
        emptyLabel="Nie brałeś udziału w żadnych aukcjach, które zostały zakończone"
        productsCards={productCards3}
      />
    </div>
  );
}

function Products({label, emptyLabel, productsCards}:{label: string, emptyLabel: string, productsCards: any}) {
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="flex-col max-w-[1400px] w-full gap-4 ">
      <div className="text-4xl text-brand-primary font-bold ">{label}</div>
      {productsCards.length
        ? <div className="w-full max-w-[1400px] p-4 bg-zinc-100 flex flex-col justify-start items-start overflow-hidden">
          {showAll ? productsCards : productsCards.slice(0, 1)}
        </div>
        : emptyLabel
      }
      {productsCards.length>1 && <div 
          className="text-brand-primary underline flex flex-1 justify-center cursor-pointer" 
          onClick={()=>{setShowAll(!showAll)}}
        >
          {!showAll ? "Pokaż więcej" : "Pokaż mniej"}
        </div>
      }
    </div>
  )
}
