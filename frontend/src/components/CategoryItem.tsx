export function CategoryItem({
  label,
  id_category,
  onClick,
  selectedItems = null,
  selected = false,
  selectable = true,
}: {
  label: string;
  id_category: number;
  onClick: any;
  selectedItems?: number | null;
  selected?: boolean;
  selectable?: boolean;
}) {
  return (
    <div
      className={`select-none px-4 py-2 inline-flex justify-center items-center gap-2.5 ${selectable && "cursor-pointer"} ${selectedItems === id_category ? `bg-orange-600 ${selectable && "hover:bg-orange-600/85"}` : `bg-orange-600/50 ${selectable && "hover:bg-orange-600/65"}`}`}
      onClick={onClick}
    >
      <div className="justify-start text-white text-base font-bold font-['Inter']">{label}</div>
    </div>
  );
}
