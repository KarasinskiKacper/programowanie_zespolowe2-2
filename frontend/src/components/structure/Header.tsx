import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectAuth } from "@/store/slices/authSelector";
import Icon from "../icon/Icon";
import { icons } from "../icon/Icon";
import { useRouter } from "next/dist/client/components/navigation";
import { handleAutoLogin } from "@/components/AutoLoginHandler";
import { Avatar } from "../Avatar";
import { useEffect, useState } from "react";

import {
  getAllAuctionsThunk,
  getArchiveAuctionsThunk,
  getAuctionCategoriesThunk,
  getAuctionDetailsThunk,
  getAuctionPhotoThunk,
  getUserAuctionsThunk,
  getUserOwnAuctionsThunk,
} from "@/store/thunks/AuctionsThunk";
import {
  setAuctions,
  selectAllAuctions,
  selectUnsoldAuctions,
  setSearch,
  selectSearch,
} from "@/store/slices/auctionSlice";

import { socket } from "@/socket";
import { usePathname } from "next/navigation";
import { setCategories, setSelectedCategoryId } from "@/store/slices/categoriesSlice";
import {
  selectArchivedAuctions,
  selectOwnAuctions,
  selectParticipatingAuctions,
  setArchivedAuctions,
  setOwnAuctions,
  setParticipatingAuctions,
} from "@/store/slices/userAuctionSlice";
import { set } from "date-fns";

export default function Header() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const myAuctions = useAppSelector(selectOwnAuctions);
  const participantAuctions = useAppSelector(selectParticipatingAuctions);
  const archiveAuctions = useAppSelector(selectArchivedAuctions);

  const [notifications, setNotifications] = useState([]);

  const router = useRouter();
  const {
    isAuthenticated,
    access_token,
    create_account_date,
    email,
    first_name,
    last_name,
    phone_number,
  } = useAppSelector(selectAuth);
  const search = useAppSelector(selectSearch);

  handleAutoLogin();

  const loadAuctionData = async () => {
    const data = await dispatch<any>(getAllAuctionsThunk());
    dispatch(setAuctions(data));

    if (accessToken == null) return;

    const own = await dispatch<any>(getUserOwnAuctionsThunk());
    dispatch(setOwnAuctions(own));

    const participating = await dispatch<any>(getUserAuctionsThunk());
    dispatch(setParticipatingAuctions(participating));

    const archived = await dispatch<any>(getArchiveAuctionsThunk());
    dispatch(setArchivedAuctions(archived));
    console.log("socket.connected", socket.connected);

    for (const ownAction of own) {
      socket.emit("join", { auction: ownAction.id_auction });
    }

    for (const participatingAction of participating) {
      socket.emit("join", { auction: participatingAction.id_auction });
    }
  };

  const onAuctionUpdated = async (data) => {
    console.log("onAuctionUpdated");
    loadAuctionData();

    const notifData = await dispatch(getAuctionDetailsThunk(data.id_auction));
    const photoData = await dispatch(getAuctionPhotoThunk(notifData.main_photo));
    console.log(notifData);

    // notifications.push({
    //   name: notifData.title,
    //   href: `/aukcja/${data.id_auction}`,
    //   img_src: "/no-image.png",
    //   price: 300,
    //   buttonMsg: "Zobacz",
    // });

    const tmp = [...notifications];
    tmp.push({
      name: notifData.title,
      href: "/aukcja/" + data.id_auction,
      img_src: photoData,
      price: Math.round(notifData.current_price),
      buttonMsg: "Zobacz",
    });
    setNotifications(tmp);

    console.log(data.id_auction);
  };
  const onAuctionClosed = () => {
    console.log("onAuctionUpdated");
    loadAuctionData();
  };

  const scheduler_check = () => {
    console.log("scheduler_check");
  };

  useEffect(() => {
    dispatch(setSearch(""));
  }, [pathname, dispatch]);

  useEffect(() => {
    const load = async () => {
      const categories = await dispatch<any>(getAuctionCategoriesThunk());
      dispatch(setCategories(categories));
    };
    load();
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    socket.on("auction_updated", onAuctionUpdated);
    socket.on("auction_closed", onAuctionClosed);
    socket.on("scheduler_check", scheduler_check);

    return () => {
      socket.off("auction_updated");
      socket.off("auction_closed");
    };
  }, [isAuthenticated, notifications]);

  const accessToken = useAppSelector((state) => state.auth.access_token);

  useEffect(() => {
    loadAuctionData();
  }, [accessToken, dispatch]);

  return (
    <div className="flex-1 px-8 bg-brand-primary justify-start items-start fixed w-full z-10">
      <div
        className="pr-8 py-8 inline-flex flex-col justify-start items-start gap-2.5 cursor-pointer"
        onClick={() => {
          router.push("/");
        }}
      >
        <Icon name="logo" />
      </div>
      {isAuthenticated && (
        <div className="flex-1 self-stretch py-4 inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden">
          <div className="self-stretch flex-1 pl-4 bg-white inline-flex justify-start items-center overflow-hidden">
            <input
              className="flex-1 h-full outline-none border-none text-2xl font-bold font-['Inter']"
              placeholder="Szukaj..."
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
            />
            <div className="px-4 py-3 flex justify-start items-center gap-2.5">
              <Icon name="search" size={32} color="#f00" />
            </div>
          </div>
        </div>
      )}
      {isAuthenticated && (
        <div className="self-stretch flex justify-start items-center">
          <div className="self-stretch px-8 flex justify-start items-center">
            <HeaderIcon name="add" size={40} onClick={() => router.push("/nowa-aukcja")} />
            <HeaderIcon name="auctions" size={40} onClick={() => router.push("/moje-aukcje")} />
            <HeaderNotifications notifications={notifications} />
          </div>
          <div
            onClick={() => {
              router.push("/profil");
            }}
            className="self-stretch justify-start items-center px-2 gap-4 pt-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)]"
          >
            <div className="justify-start text-white text-2xl font-bold font-['Inter'] underline select-none">
              {first_name} {last_name}
            </div>
            <Avatar size={48} />
          </div>
        </div>
      )}
      {!isAuthenticated && (
        <div className="flex-1 self-stretch justify-end items-center ">
          <div
            className="self-stretch items-center p-2 text-white text-xl font-bold font-['Inter'] underline hover:bg-[rgba(255,255,255,0.1)] cursor-pointer"
            onClick={() => {
              router.push("/logowanie");
            }}
          >
            Zaloguj się
          </div>
        </div>
      )}
    </div>
  );
}
const HeaderIcon = ({
  name,
  size,
  onClick = () => {},
}: {
  name: keyof typeof icons;
  size: number;
  onClick?: () => void;
}) => {
  return (
    <div
      className="self-stretch px-4 flex justify-start items-center cursor-pointer hover:bg-[rgba(255,255,255,0.1)]"
      onClick={onClick}
    >
      <Icon name={name} size={size} color="#fff" />
    </div>
  );
};

const HeaderNotifications = ({ notifications }) => {
  console.log("notifications", notifications);

  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="h-full" onClick={() => setIsOpen(!isOpen)}>
      <HeaderIcon name={notifications.length ? "ringinfo" : "ring"} size={32} />
      {isOpen && (
        <div className="w-[512px] p-4 right-0 top-24 absolute bg-white border-l-4 border-r-4 border-b-4 border-brand-primary inline-flex flex-col justify-center items-start gap-8">
          {notifications.length ? (
            notifications.map((n, index) => <NotificationItem key={index} notification={n} />)
          ) : (
            <div className="py-4 px-4 text-lg select-none">Nie masz żadnych powiadomień</div>
          )}
        </div>
      )}
    </div>
  );
};

const NotificationItem = ({ notification }) => {
  const router = useRouter();
  return (
    <div
      data-property-1="Default"
      className="w-[480px] inline-flex justify-center items-start gap-4 cursor-pointer"
      onClick={() => router.push(notification.href)}
    >
      <img src={notification.img_src} className="w-32 h-32 object-contain" />
      <div className="flex-1 inline-flex flex-col justify-center items-start gap-4">
        <div className="justify-start text-black text-2xl font-bold font-['Inter']">
          {notification.name}
        </div>
        <div className="self-stretch inline-flex justify-between items-end">
          <div className="inline-flex flex-col justify-center items-start">
            {/* <div className="justify-start text-black text-2xl font-normal font-['Inter']">{notification.userName} {notification.userSurname[0]}.</div> */}
            <div className="justify-start text-brand-primary text-4xl font-bold font-['Inter']">
              {notification.price}zł
            </div>
          </div>
          {notification.buttonMsg && (
            <div className="px-8 py-2 bg-brand-primary flex justify-center items-center gap-2.5 cursor-pointer hover:bg-brand-primary/80">
              <div className="justify-start text-white text-xl font-bold font-['Inter']">
                {notification.buttonMsg}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};