import { selectAuth } from "@/store/slices/authSelector";
import { useAppSelector } from "@/store/store";

/**
 * Returns a div element with a background color derived from the name and surname,
 * and displays the name and surname inside the div.
 *
 * @param {number} size - size of the div
 * @param {string} name - name to display
 * @param {string} surname - surname to display
 */
export function Avatar({size=32, name="", surname=""}: {size?: number, name?: string, surname?: string}) {
    if(!name||!surname){
        const {
            first_name,
            last_name,
        } = useAppSelector(selectAuth);
        name = first_name || "?"
        surname = last_name || "?"
    }
    

/**
 * Returns the hash value of a given string. The hash is a 32-bit positive
 * integer, which is calculated by summing the ASCII values of the characters and
 * taking the modulus of the sum by 2^11.
 * @param {string} str - the string to hash
 * @return {number} the hash value
 */
    const hashString = (str: string) => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash)
        }
        return Math.abs(hash)*11/7
    }

/**
 * This function takes a string seed and returns a color derived from the seed in the following format:
 * hsl(${hue}, ${saturation}%, ${lightness}%)
 * The hash value is a 32-bit positive integer, which is calculated by summing the ASCII values of the characters and
* taking the modulus of the sum by 2^11. The hue is the hash value modulo 360, the saturation is 55 plus the hash value modulo 40, and the lightness is 30 plus the hash value modulo 30.
 * @param {string} seed - the string to hash
 * @return {string} the color derived from the seed
 */
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