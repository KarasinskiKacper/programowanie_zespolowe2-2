import { useState, useEffect } from "react";

import { AuctionCard } from "@/components/AuctionCard";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  getUserOwnAuctionsThunk,
  getUserAuctionsThunk,
  getArchiveAuctionsThunk,
} from "@/store/thunks/AuctionsThunk";

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

  const [myAuctions, setMyAuctions] = useState(myAuctionsPlaceholder);
  const [participantAuctions, setParticipantAuctions] = useState(participantAuctionsPlaceholder);
  const [archiveAuctions, setArchiveAuctions] = useState(archiveAuctionsPlaceholder);

  const accessToken = useAppSelector((state) => state.auth.access_token);
  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      const myAuctionsResponse = await dispatch(getUserOwnAuctionsThunk());
      const myAuctionsData = myAuctionsResponse.map((product: any) => ({
        id: String(product.id_auction),
        name: product.title,
        price: Math.round(product.current_price),
        imageUrl: product.main_photo,
        endDate: product.end_date,
      }));
      setMyAuctions(myAuctionsData);

      const participantAuctionsResponse = await dispatch(getUserAuctionsThunk());
      const participantAuctionsData = participantAuctionsResponse.map((product: any) => ({
        id: String(product.id_auction),
        name: product.title,
        price: Math.round(product.current_price),
        imageUrl: product.main_photo,
        endDate: product.end_date,
      }));
      setParticipantAuctions(participantAuctionsData);

      const archiveAuctionsResponse = await dispatch(getArchiveAuctionsThunk());
      const archiveAuctionsData = archiveAuctionsResponse.map((product: any) => ({
        id: String(product.id_auction),
        name: product.title,
        price: Math.round(product.final_price),
        imageUrl: product.main_photo,
        endDate: product.end_date,
      }));
      console.log(participantAuctionsResponse);

      setArchiveAuctions(archiveAuctionsData);
    })();
  }, [accessToken]);

  const productCards1 = myAuctions
    .reduce((rows: any[], product, index) => {
      if (index % 5 === 0) rows.push([]);
      rows[rows.length - 1].push(product);
      return rows;
    }, [])
    ?.map((row, rowIndex) => (
      <div key={rowIndex} className="self-stretch inline-flex justify-start items-center gap-4">
        {row.map((product: any) => (
          <AuctionCard key={product.id} product={product} />
        ))}
      </div>
    ));

  const productCards2 = participantAuctions
    .reduce((rows: any[], product, index) => {
      if (index % 5 === 0) rows.push([]);
      rows[rows.length - 1].push(product);
      return rows;
    }, [])
    ?.map((row, rowIndex) => (
      <div key={rowIndex} className="self-stretch inline-flex justify-start items-center gap-4">
        {row.map((product: any) => (
          <AuctionCard key={product.id} product={product} />
        ))}
      </div>
    ));

  const productCards3 = archiveAuctions
    .reduce((rows: any[], product, index) => {
      if (index % 5 === 0) rows.push([]);
      rows[rows.length - 1].push(product);
      return rows;
    }, [])
    ?.map((row, rowIndex) => (
      <div key={rowIndex} className="self-stretch inline-flex justify-start items-center gap-4">
        {row.map((product: any) => (
          <AuctionCard key={product.id} product={product} />
        ))}
      </div>
    ));

  return (
    <div className="self-stretch py-16 inline-flex flex-col justify-start items-center gap-16 overflow-hidden">
      <div className="flex-col gap-4">
        <div className="text-4xl text-brand-primary font-bold">Moje aukcje</div>
        <div className="w-full max-w-[1400px] p-4 bg-zinc-100 flex flex-col justify-start items-start gap-8 overflow-hidden">
          {productCards1}
        </div>
      </div>
      <div className="flex-col gap-4">
        <div className="text-4xl text-brand-primary font-bold">Aukcje w których biorę udział</div>
        <div className="w-full max-w-[1400px] p-4 bg-zinc-100 flex flex-col justify-start items-start gap-8 overflow-hidden">
          {productCards2}
        </div>
      </div>
      <div className="flex-col gap-4">
        <div className="text-4xl text-brand-primary font-bold">Archiwum</div>
        <div className="w-full max-w-[1400px] p-4 bg-zinc-100 flex flex-col justify-start items-start gap-8 overflow-hidden">
          {productCards3}
        </div>
      </div>
    </div>
  );
}
