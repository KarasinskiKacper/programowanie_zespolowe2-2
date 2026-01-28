import { Button } from "@/components/inputs/Button";
import { useAppDispatch, useAppSelector } from "@/store/store";
import React from "react";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseISO, format } from 'date-fns'
import jwt from "jsonwebtoken";

import { useCountdown } from "@/hooks/useCountdown";

import {
  getAuctionPhotoThunk,
  getAuctionDetailsThunk,
  placeBidThunk,
} from "@/store/thunks/AuctionsThunk";
import { CategoryItem } from "@/components/CategoryItem";
import { Avatar } from "@/components/Avatar";
import { socket } from "@/socket";

export default function AuctionPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const auctionId = params["auction-slug"];

  const userData = useAppSelector((state) => state.auth);

  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const [auctionData, setAuctionData] = useState(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [bid, setBid] = useState(0);
  const [minBid, setMinBid] = useState(0);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);

  const loadAuctionData = async () => {
    const auctionDetails = await dispatch(getAuctionDetailsThunk(auctionId));

    const imagesUrl = [auctionDetails.main_photo, ...auctionDetails.photos];
    const images = [];
    await imagesUrl.forEach(async (imageUrl) => {
      const photoData = await dispatch(getAuctionPhotoThunk(imageUrl));
      images.push(photoData);
    });

    const data = {
      title: auctionDetails.title,
      startPrice: Math.round(auctionDetails.start_price),
      price: Math.round(auctionDetails.current_price),
      time: auctionDetails.end_date,
      owner: {
        name: auctionDetails.seller_name,
        avatarUrl: "", // TODO: add avatar url
        id: auctionDetails.id_seller,
      },
      winner: {
        name: auctionDetails.winner_name,
        avatarUrl: "", // TODO: add avatar url
        id: auctionDetails.id_winner,
        time: auctionDetails.id_winner ? auctionDetails.end_date : null,
      },
      startDate: auctionDetails.start_date,
      endDate: auctionDetails.end_date,
      description: auctionDetails.description.trim(),
      images: images,
      overtime: auctionDetails.overtime,
      categories: auctionDetails.categories,
      status: auctionDetails.status,
    };
    setEndDate(data.endDate);
    setAuctionData(data);
    console.log(data);

    setBid(Math.round(auctionDetails.current_price) + 1);
    setMinBid(Math.round(auctionDetails.current_price) + 1);
  };

  const onAuctionUpdated = (data) => {
    if (data.id_auction != auctionId) return;
    loadAuctionData();
  };

  useEffect(() => {
    loadAuctionData();

    socket.on("auction_updated", onAuctionUpdated);

    return () => {
      socket.off("auction_updated", onAuctionUpdated);
    };
  }, [auctionData?.price]);

  const end = new Date(endDate);
  const overtime2 = auctionData?.overtime ? auctionData?.overtime : 0;
  const realEnd = new Date(end.getTime() + overtime2 * 1000).toISOString();
  const timeLeft = useCountdown(realEnd);

  return (
    <div className="self-stretch py-8 inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden ">
      <div className="w-full max-w-[1400px] flex flex-col justify-start items-start gap-16 overflow-hidden">
        <div className="self-stretch inline-flex justify-start items-center gap-8 ">
          <div className="self-stretch flex-1 p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-start gap-4">
            <div className="self-stretch justify-start text-black text-3xl font-bold font-['Inter']">
              {auctionData?.title}
            </div>
            <div className="self-stretch h-full flex flex-col justify-start items-start gap-8">
              <img
                src={
                  auctionData?.images[selectedImageIndex]?.length > 3
                    ? auctionData?.images[selectedImageIndex]
                    : "/no-image.png"
                }
                className={`self-stretch w-full h-full object-contain`}
              />
              <div className="self-stretch inline-flex justify-start items-center gap-4">
                {auctionData?.images.map((image: string, index: number) => (
                  <div key={index} className="w-32 h-32">
                    <img
                      src={image?.length > 3 ? image : "/no-image.png"}
                      className={`w-full h-full object-cover  ${index === selectedImageIndex ? "border-4 border-brand-primary" : ""}`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-[512px] self-stretch p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-start gap-8 overflow-hidden">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="self-stretch text-center justify-start text-zinc-400 text-xl font-bold font-['Inter']">
                Czas do końca aukcji
              </div>
              <div className="self-stretch text-center justify-start text-black text-3xl font-bold font-['Inter']">
                {timeLeft}
              </div>
            </div>
            <div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
            <div className="self-stretch flex flex-col justify-start items-start gap-8">
              <div className="flex flex-col justify-start items-start gap-2">
                <div className="inline-flex justify-center items-end gap-1">
                  <div className="justify-start text-brand-primary text-8xl font-bold font-['Inter']">
                    {auctionData?.price}
                  </div>
                  <div className="justify-start text-brand-primary text-6xl font-bold font-['Inter']">
                    zł
                  </div>
                </div>

                {auctionData?.winner?.name ? (
                  <>
                    <div className="flex-col self-stretch text-2xl font-semibold text-orange-600 gap-2">
                      Wygrał:
                    </div>
                    <div className="inline-flex justify-start items-center gap-2">
                      <Avatar
                        size={16 * 4}
                        name={auctionData?.winner?.name?.split(" ")[0]}
                        surname={auctionData?.winner?.name?.split(" ")[1]}
                      />
                      <div className="inline-flex flex-col justify-center items-start gap-1">
                        <div className="justify-start text-black text-xl font-bold font-['Inter']">
                          {auctionData?.winner?.name}
                        </div>
                        <div className="justify-start text-neutral-500 text-xl font-normal font-['Inter']">
                          {auctionData?.winner?.time &&
                            format(parseISO(auctionData?.winner?.time), "dd.MM.yyyy HH:mm")}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-2xl text-brand-primary font-bold">Cena startowa</div>
                )}
              </div>
              <div className="self-stretch inline-flex justify-start items-start gap-4">
                {auctionData?.owner.id != jwt.decode(userData?.access_token)?.sub &&
                  auctionData?.status === "at_auction" &&
                  userData.isAuthenticated && (
                    <>
                      <input
                        type="number"
                        className="flex-2 h-12 border-2 border-orange-600 px-4 text-2xl w-1"
                        min={minBid}
                        value={bid}
                        onChange={(e) => {
                          setBid(Math.round(Number(e.target.value)));
                        }}
                      />
                      <Button
                        label="Przebij"
                        onClick={async () => {
                          if (await dispatch(placeBidThunk(auctionId, bid))) {
                            setBidError("");
                            setBidSuccess("Przebiłeś ofertę.");
                            socket.emit("join", { auction: auctionId });
                          } else {
                            setBidSuccess("");
                            setBidError("Coś poszło nie tak.");
                          }
                        }}
                        size="small"
                      />
                    </>
                  )}
              </div>
              {bidError && (
                <div className="justify-start text-red-600 text-base font-bold font-['Inter']">
                  {bidError}
                </div>
              )}
              {bidSuccess && (
                <div className="justify-start text-green-600 text-base font-bold font-['Inter']">
                  {bidSuccess}
                </div>
              )}
            </div>
            <div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
            <div className="flex flex-col justify-start items-start gap-4">
              <div className="inline-flex justify-start items-center gap-2">
                <Avatar
                  size={32}
                  name={auctionData?.owner?.name?.split(" ")[0]}
                  surname={auctionData?.owner?.name?.split(" ")[1]}
                />
                <div className="justify-start text-black text-xl font-bold font-['Inter']">
                  {auctionData?.owner?.name}
                </div>
              </div>
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="inline-flex justify-start items-start gap-2">
                  <div className="justify-start text-black text-xl font-normal font-['Inter']">
                    Cena początkowa:
                  </div>
                  <div className="justify-start text-black text-xl font-normal font-['Inter']">
                    {auctionData?.startPrice}zł
                  </div>
                </div>
                <div className="inline-flex justify-start items-start gap-2">
                  <div className="justify-start text-black text-xl font-normal font-['Inter']">
                    Start aukcji:
                  </div>
                  <div className="justify-start text-black text-xl font-normal font-['Inter']">
                    {auctionData?.startDate &&
                      format(parseISO(auctionData?.startDate), "dd.MM.yyyy HH:mm")}
                  </div>
                </div>
                <div className="inline-flex justify-start items-start gap-2">
                  <div className="justify-start text-black text-xl font-normal font-['Inter']">
                    Koniec aukcji:{" "}
                  </div>
                  <div className="justify-start text-black text-xl font-normal font-['Inter']">
                    {auctionData?.endDate &&
                      format(parseISO(auctionData?.endDate), "dd.MM.yyyy HH:mm")}
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
            <div className="flex-col self-stretch text-2xl font-semibold text-orange-600 gap-2">
              Kategorie:
              <div className="gap-4 flex-wrap">
                {auctionData?.categories.map((category) => (
                  <CategoryItem
                    label={category}
                    onClick={() => {}}
                    selected={true}
                    selectable={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 flex flex-col justify-start items-start gap-4 overflow-hidden">
          <div className="justify-start text-orange-600 text-2xl font-bold font-['Inter']">
            Opis
          </div>
          <div className="self-stretch justify-start flex-col">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{auctionData?.description}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
