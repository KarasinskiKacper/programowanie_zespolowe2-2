import { Button } from "@/components/inputs/Button";
import { TextInput } from "@/components/inputs/TextInput";
import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAppDispatch, useAppSelector } from "@/store/store";
import { handleAutoLoginWithRerouteToLoginPage } from "@/components/AutoLoginHandler";
import { createNewAuctionThunk, getAuctionCategoriesThunk } from "@/store/thunks/AuctionsThunk";
import { useRouter } from "next/navigation";
import Icon from "@/components/icon/Icon";
import { CategoryItem } from "@/components/CategoryItem";
import { selectCategories } from "@/store/slices/categoriesSlice";

const toDatetimeLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};
const addMinutesToDatetimeLocal = (dt: string, minutes: number) => {
  if (!dt) return "";
  const d = new Date(dt);
  d.setMinutes(d.getMinutes() + minutes);
  return toDatetimeLocal(d);
};

type ImageItem = { file: File; previewUrl: string };

export default function NewAuctionPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [title, setTitle] = useState("Tytuł produktu");
  const [startPrice, setStartPrice] = useState("100");
  const [description, setDescription] = useState("Opis produktu");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  handleAutoLoginWithRerouteToLoginPage();

  const [nowDateMin, setNowDateMin] = useState(() => toDatetimeLocal(new Date()));

  useEffect(() => {
    const tick = () => setNowDateMin(toDatetimeLocal(new Date()));
    tick();

    const id = setInterval(tick, 5_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (startDate && startDate < nowDateMin) {
      const fixedStart = nowDateMin;
      setStartDate(fixedStart);

      const fixedEndMin = addMinutesToDatetimeLocal(fixedStart, 1);
      if (!endDate || endDate < fixedEndMin) setEndDate(fixedEndMin);
      return;
    }
    const fromStart = startDate ? addMinutesToDatetimeLocal(startDate, 1) : "";
    const currentEndMin = fromStart && fromStart > nowDateMin ? fromStart : nowDateMin;
    if (endDate && endDate < currentEndMin) setEndDate(currentEndMin);
  }, [nowDateMin]);

  const endDateMin = useMemo(() => {
    const fromStart = startDate ? addMinutesToDatetimeLocal(startDate, 1) : "";
    return fromStart && fromStart > nowDateMin ? fromStart : nowDateMin;
  }, [startDate, nowDateMin]);

  const onAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImages((prev) => [...prev, { file, previewUrl }]);

    e.target.value = "";
  };

  const categoryItems = ["RTV/AGD", "Elektronika", "Dom", "Auto", "Dzieci"];
  const [categories, setCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState<Array<number>>([]);

  useEffect(() => {
    const load = async () => {
      const categories = await dispatch<any>(getAuctionCategoriesThunk());
      console.log(categories);

      setCategories(categories);
    };
    load();
  }, [dispatch]);

  const parseToMarkdown = (markdown) => {
    return markdown.replace(/(?<!  )\n/g, "  \n");
  };

  console.log(selectedItems);

  return (
    <div className="self-stretch py-8 inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden">
      <div className="w-full max-w-[1400px] flex flex-col justify-start items-start gap-16 overflow-hidden">
        <div className="self-stretch inline-flex justify-start items-center gap-8">
          <div className="flex-1 p-8 self-stretch outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-start gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="self-stretch justify-start text-black text-3xl font-bold font-['Inter']"
            />
            <div className="self-stretch h-full flex flex-col justify-start items-start gap-8">
              <div className="w-full h-full relative">
                <img
                  src={images.length ? images[selectedImageIndex]?.previewUrl : "/no-image.png"}
                  className={`w-full h-full object-contain max-h-96`}
                />
                {!!images.length && (
                  <div
                    className="absolute right-0 bottom-0 p-4 cursor-pointer"
                    onClick={() => {
                      setImages((prev) => prev.filter((img, index) => index != selectedImageIndex));
                      if (selectedImageIndex) setSelectedImageIndex(selectedImageIndex - 1);
                    }}
                  >
                    <Icon name="trash" color="#DD0000" size={48}></Icon>
                  </div>
                )}
              </div>
              <div className="self-stretch inline-flex justify-start items-center gap-4">
                {images.map((image: ImageItem, index: number) => (
                  <div
                    key={index}
                    className={`cursor-pointer w-32 h-32 bg-neutral-400 outline outline-brand-primary hover:outline-4 ${index === selectedImageIndex ? "outline-4" : ""}`}
                  >
                    <img
                      src={image.previewUrl}
                      className={`w-full h-full object-cover`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  </div>
                ))}
                <label className="cursor-pointer w-32 h-32 relative hover:outline-4 outline outline-2 outline-brand-primary">
                  <input type="file" className="hidden" onChange={onAddImage} />
                  <div className="absolute bottom-1 w-32 h-32 items-center justify-center text-8xl font-center text-brand-primary select-none">
                    +
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="w-[512px] self-stretch p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 inline-flex flex-col justify-start items-start gap-8 overflow-hidden">
            <div className="self-stretch flex flex-col justify-start items-start gap-8">
              <div className="flex flex-col justify-start items-start gap-2">
                <div className="inline-flex justify-center items-end gap-1">
                  <input
                    value={startPrice}
                    onChange={(e) =>
                      setStartPrice(Number(e.target.value) > 0 ? e.target.value : "0")
                    }
                    type="number"
                    className="w-64 justify-start text-brand-primary text-8xl font-bold font-['Inter']"
                  />
                  <div className="justify-start text-brand-primary text-6xl font-bold font-['Inter']">
                    zł
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
            <div className="flex-col self-stretch text-2xl font-semibold text-orange-600">
              Początek aukcji:
              <input
                type="datetime-local"
                className="mb-4 p-2 border border-gray-300 rounded-md text-black font-normal"
                value={startDate}
                min={nowDateMin}
                onChange={(e) => {
                  const v = e.target.value;
                  setStartDate(v >= nowDateMin ? v : nowDateMin);

                  const minEnd = v ? addMinutesToDatetimeLocal(v, 1) : "";
                  if (endDate && minEnd && endDate < minEnd) setEndDate(minEnd);
                }}
              />
              Koniec aukcji:
              <input
                type="datetime-local"
                className="mb-4 p-2 border border-gray-300 rounded-md text-black font-normal"
                value={endDate}
                min={endDateMin}
                onChange={(e) =>
                  setEndDate(e.target.value >= endDateMin ? e.target.value : endDateMin)
                }
              />
            </div>
            <div className="flex-col self-stretch text-2xl font-semibold text-orange-600 gap-2">
              Kategorie:
              <div className="gap-4 flex-wrap">
                {categories.map((category) => (
                  <CategoryItem
                    label={category.category_name}
                    onClick={() => {
                      if (selectedItems.includes(category.id_category))
                        setSelectedItems(
                          selectedItems.filter((item) => item != category.id_category),
                        );
                      else setSelectedItems([...selectedItems, category.id_category]);
                    }}
                    selectedItemsOverride={selectedItems.includes(category?.id_category)}
                  />
                ))}
              </div>
            </div>
            <div className="self-stretch h-0.5 relative bg-orange-600 rounded-[5px]" />
            <Button
              label="Utwórz aukcję"
              onClick={async () => {
                if (
                  !title ||
                  !startPrice ||
                  !description ||
                  !startDate ||
                  !endDate ||
                  images.length === 0
                ) {
                  setError("Nie wszystkie pola zostały wypełnione.");
                  return;
                }

                if (
                  (await dispatch(
                    createNewAuctionThunk({
                      images,
                      title,
                      startPrice: Number(startPrice),
                      description,
                      startDate,
                      endDate,
                      categories: selectedItems,
                    }),
                  )) == false
                ) {
                  setError("Coś poszło nie tak podczas tworzenia aukcji.");
                } else {
                  router.push("/");
                }
              }}
              size="large"
            />
            {error && (
              <div className="justify-start text-red-600 text-base font-bold font-['Inter']">
                {error}
              </div>
            )}
          </div>
        </div>
        <div className="self-stretch p-8 outline outline-2 outline-offset-[-2px] outline-orange-600 flex flex-col justify-start items-start gap-4 overflow-hidden">
          <div className="justify-start text-orange-600 text-2xl font-bold font-['Inter']">
            Opis
          </div>
          <div className="self-stretch justify-start">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex flex-1 min-h-128 p-2"
              placeholder="Opis produktu..."
            />
            <div className="flex-1 p-2 markdown flex-col">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parseToMarkdown(description)}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
