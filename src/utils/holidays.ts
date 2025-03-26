import axios from "axios";

export async function getHolidays(countryCode: string) : Promise<any>
{
    try {
        const currentYear = new Date().getFullYear();
        const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode}`);
        return response.data;
    } catch (error) {
        console.error('Error in country code', error);
    }
}
