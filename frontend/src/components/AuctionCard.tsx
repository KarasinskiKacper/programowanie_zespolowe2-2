import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/store";

import { useCountdown } from "@/hooks/useCountdown";

import { getAuctionPhotoThunk } from "@/store/thunks/AuctionsThunk";
import { get } from "http";

export const AuctionCard = ({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    endDate: string;
    slug: string;
  };
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const timeLeft = useCountdown(product.endDate);
  const [imageAPIUrl, setImageUrl] = useState("");

  useEffect(() => {
    (async () => {
      const photoData = await dispatch(getAuctionPhotoThunk(product.imageUrl));
      setImageUrl(photoData.length>3 ? photoData :  "/no-image.png");
    })();
  }, []);

  return (
    <div className="w-1/5 p-2">
      <div
        className="w-full p-4 bg-white inline-flex flex-col justify-start items-start gap-6 overflow-hidden cursor-pointer"
        onClick={() => {
          router.push(`/aukcja/${product.id}`);
        }}
      >
        <img className="self-stretch flex aspect-video w-full object-contain" src={imageAPIUrl} />
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
              <div className="inline-flex justify-center items-end gap-1">
                <div className="justify-start text-brand-primary text-4xl font-bold font-['Inter']">
                  {product.price}
                </div>
                <div className="justify-start text-brand-primary text-2xl font-bold font-['Inter']">
                  zł
                </div>
              </div>
              <div className="self-stretch inline-flex justify-center items-center gap-2.5">
                <div className="flex-1 justify-start text-black text-xl font-normal font-['Inter']">
                  {product.name}
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
