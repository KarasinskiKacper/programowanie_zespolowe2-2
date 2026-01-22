import { selectAuth } from "@/store/slices/authSelector";
import { useAppSelector } from "@/store/store";

export function Avatar({size=32, name="", surname=""}: {size?: number, name?: string, surname?: string}) {
    if(!name||!surname){
        const {
            first_name,
            last_name,
        } = useAppSelector(selectAuth);
        name = first_name || "?"
        surname = last_name || "?"
    }
    

    const hashString = (str: string) => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash)
        }
        return Math.abs(hash)*11/7
    }

    const colorFromSeed = (seed: string) => {
        const hash = hashString(seed)
        
        const hue = hash % 360          
        const saturation = 55 + (hash % 40)  
        const lightness = 30 + (hash % 30)   
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }
      

    return(
        <div 
            style={{
                width: size, 
                height: size,
                fontSize: 20*size/48,
                backgroundColor: colorFromSeed(name+surname)
            }}
            className={`bg-red-100 rounded-full items-center justify-center font-bold text-white`} 
        >
            {name[0]+surname[0]}
        </div>
    );
}