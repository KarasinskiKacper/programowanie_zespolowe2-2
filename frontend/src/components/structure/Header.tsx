import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectAuth } from "@/store/slices/authSelector";
import Icon from "../icon/Icon";
import { icons } from "../icon/Icon";
import { useRouter } from "next/dist/client/components/navigation";
import { handleAutoLogin } from "@/components/AutoLoginHandler";

export default function Header() {
  const dispatch = useAppDispatch();
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

  handleAutoLogin();

  return (
    <div className="flex-1 px-8 bg-brand-primary inline-flex justify-start items-start">
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
            <HeaderIcon name="add" size={40} />
            <HeaderIcon name="auctions" size={40} />
            <HeaderIcon name="ring" size={32} />
          </div>
          <div
            onClick={() => {
              router.push("/profil");
            }}
            className="self-stretch justify-start items-center px-2 gap-2 pt-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)]"
          >
            <div className="justify-start text-white text-2xl font-bold font-['Inter'] underline">
              {first_name} {last_name}
            </div>
            <Icon name="user" size={32} />
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
const HeaderIcon = ({ name, size, onClick = () => {} }: { name: keyof typeof icons; size: number; onClick?: () => void }) => {
	return (
		<div className="self-stretch px-4 flex justify-start items-center cursor-pointer hover:bg-[rgba(255,255,255,0.1)]" onClick={onClick}>
			<Icon name={name} size={size} color="#fff" />
		</div>
	);
};
