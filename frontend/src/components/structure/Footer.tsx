import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectAuth } from "@/store/slices/authSelector";
import Icon from "../icon/Icon";
import { icons } from "../icon/Icon";
import { useRouter } from "next/dist/client/components/navigation";
import { handleAutoLogin } from "@/components/AutoLoginHandler";
import Link from "next/link";
import {
  selectCategories,
  selectSelectedCategoryId,
  setSelectedCategoryId,
} from "@/store/slices/categoriesSlice";

export default function Footer() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const categoryItems = useAppSelector(selectCategories);
  const selectedCategoryId = useAppSelector(selectSelectedCategoryId);

  return (
    <div className="self-stretch p-16 bg-orange-600 inline-flex justify-center items-start gap-80 overflow-hidden">
      <div className="flex-1 max-w-[1400px] flex justify-start items-start gap-16">
        <div className="flex-1 pr-8 py-8 inline-flex flex-col justify-start items-start gap-2.5">
          <Icon name="logo" size={64} onClick={() => router.push("/")} />
        </div>
        <div className="w-px self-stretch relative bg-white" />
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
          <div className="justify-start text-white text-5xl font-bold font-['Inter']">
            Kategorie
          </div>
          <div className="self-stretch inline-flex justify-between items-start">
            <div className="inline-flex flex-col justify-start items-start gap-2">
              {categoryItems.map((category, index) => {
                if (index % 2 == 0)
                  return (
                    <FooterLink
                      key={category.id_category}
                      label={category.category_name}
                      onClick={() => {
                        dispatch(
                          setSelectedCategoryId(
                            selectedCategoryId === category.id_category
                              ? null
                              : category.id_category,
                          ),
                        );
                        router.push("/");
                      }}
                    />
                  );
              })}
            </div>
            <div className="inline-flex flex-col justify-start items-start gap-2">
              {categoryItems.map((category, index) => {
                if ((index + 1) % 2 == 0)
                  return (
                    <FooterLink
                      key={category.id_category}
                      label={category.category_name}
                      onClick={() => {
                        dispatch(
                          setSelectedCategoryId(
                            selectedCategoryId === category.id_category
                              ? null
                              : category.id_category,
                          ),
                        );
                        router.push("/");
                      }}
                    />
                  );
              })}
            </div>
          </div>
        </div>
        <div className="w-px self-stretch relative bg-white" />
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
          <div className="justify-start text-white text-5xl font-bold font-['Inter']">Menu</div>
          <div className="flex flex-col justify-start items-start gap-2">
            <div
              onClick={() => {
                router.push("/nowa-aukcja");
              }}
              className="justify-start text-white/80 text-2xl font-bold font-['Inter'] underline cursor-pointer "
            >
              Nowa aukcja
            </div>
            <div
              onClick={() => {
                router.push("/moje-aukcje");
              }}
              className="justify-start text-white/80 text-2xl font-bold font-['Inter'] underline cursor-pointer "
            >
              Moje aukcje
            </div>
            <div
              onClick={() => {
                router.push("/profil");
              }}
              className="justify-start text-white/80 text-2xl font-bold font-['Inter'] underline cursor-pointer "
            >
              Profil
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FooterLink = ({
  className = "",
  label,
  onClick,
}: {
  className?: string;
  label: string;
  onClick;
}) => {
  return (
    <p
      className={
        "justify-start text-white/80 text-2xl font-bold font-['Inter'] underline cursor-pointer " +
        className
      }
      onClick={onClick}
    >
      {label}
    </p>
  );
};

