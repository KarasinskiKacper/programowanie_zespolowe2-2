import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/store";

import { useCountdown } from "@/hooks/useCountdown";

import { getAuctionPhotoThunk } from "@/store/thunks/AuctionsThunk";

export const AuctionCard = ({
  product,
}: {
  product: {
    id_auction: number;
    title: string;
    current_price: number;
    main_photo: string;
    end_date: string;
    slug: string;
    overtime: number | null;
  };
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const end = new Date(product.end_date);
  const overtime2 = product.overtime ? product.overtime : 0;
  const realEnd = new Date(end.getTime() + overtime2 * 1000).toISOString();
  const timeLeft = useCountdown(realEnd);

  const [imageAPIUrl, setImageUrl] = useState("");

  useEffect(() => {
    (async () => {
      const photoData = await dispatch(getAuctionPhotoThunk(product.main_photo));
      setImageUrl(photoData);
    })();
  }, []);

  return (
    <div className="w-1/5 p-2">
      <div
        className="w-full p-4 bg-white inline-flex flex-col justify-start items-start gap-6 overflow-hidden cursor-pointer"
        onClick={() => {
          router.push(`/aukcja/${String(product.id_auction)}`);
        }}
      >
        <img
          className="self-stretch flex aspect-video w-full object-contain"
          src={imageAPIUrl.length > 3 ? imageAPIUrl : "/no-image.png"}
        />
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
              <div className="inline-flex justify-center items-end gap-1">
                <div className="justify-start text-brand-primary text-4xl font-bold font-['Inter']">
                  {Math.round(product.current_price)}
                </div>
                <div className="justify-start text-brand-primary text-2xl font-bold font-['Inter']">
                  zł
                </div>
              </div>
              <div className="self-stretch inline-flex justify-center items-center gap-2.5">
                <div className="flex-1 justify-start text-black text-xl font-normal font-['Inter']">
                  {product.title}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch flex-1 justify-start items-end text-black text-xl font-bold font-['Inter']">
          {timeLeft}
        </div>
      </div>
    </div>
  );
};
