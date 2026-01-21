import { useAppDispatch, useAppSelector } from "@/store/store";
import { selectAuth } from "@/store/slices/authSelector";
import Icon from "../icon/Icon";
import { icons } from "../icon/Icon";
import { useRouter } from "next/dist/client/components/navigation";
import { handleAutoLogin } from "@/components/AutoLoginHandler";
import Link from "next/link";

export default function Footer() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <div className="self-stretch p-16 bg-orange-600 inline-flex justify-center items-start gap-80 overflow-hidden">
        <div className="flex-1 max-w-[1400px] flex justify-start items-start gap-16">
            <div className="flex-1 pr-8 py-8 inline-flex flex-col justify-start items-start gap-2.5">
                <Icon name="logo" size={64} onClick={() => router.push("/")}/>
            </div>
            <div className="w-px self-stretch relative bg-white" />
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                <div className="justify-start text-white text-5xl font-bold font-['Inter']">Kategorie</div>
                <div className="self-stretch inline-flex justify-between items-start">
                    <div className="inline-flex flex-col justify-start items-start gap-2">
                        <FooterLink href="/" label="RTV/AGD" />
                        <FooterLink href="/" label="Elektronika" />
                        <FooterLink href="/" label="Dom" />
                        <FooterLink href="/" label="Auto" />
                        <FooterLink href="/" label="Dzieci" />
                    </div>
                    <div className="inline-flex flex-col justify-start items-start gap-2">
                        <FooterLink href="/" label="RTV/AGD" />
                        <FooterLink href="/" label="Elektronika" />
                        <FooterLink href="/" label="Dom" />
                        <FooterLink href="/" label="Auto" />
                        <FooterLink href="/" label="Dzieci" />
                    </div>
                </div>
            </div>
            <div className="w-px self-stretch relative bg-white" />
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                <div className="justify-start text-white text-5xl font-bold font-['Inter']">Menu</div>
                <div className="flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-white/80 text-2xl font-bold font-['Inter'] underline">Nowa aukcja</div>
                    <div className="justify-start text-white/80 text-2xl font-bold font-['Inter'] underline">Moje aukcje</div>
                    <div className="justify-start text-white/80 text-2xl font-bold font-['Inter'] underline">Profil</div>
                </div>
            </div>
        </div>
    </div>
  );
}

const FooterLink = ({href, className="", label}:{href: string, className?:string, label: string}) => {
    return (
        <Link href={href} className={"justify-start text-white/80 text-2xl font-bold font-['Inter'] underline " + className}>{label}</Link>
    )
}

