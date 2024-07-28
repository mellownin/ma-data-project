const axios = require('axios');
const cheerio = require('cheerio');

const CMS_ENROLL_PARENT_URL = 'https://www.cms.gov/data-research/statistics-trends-and-reports/medicare-advantagepart-d-contract-and-enrollment-data/monthly-enrollment-contract/plan/state/county';
const BASE_ENROLL_URL = 'https://www.cms.gov';
const MIN_YEAR = 2020; 

// Function: Gather All Monthly Enrollment Links from CMS and Ensure the Base URL Prefix is Added
async function getMonthlyLinks() {
    const response = await axios.get(CMS_ENROLL_PARENT_URL);
    const $ = cheerio.load(response.data);
    const links = [];

    $('table tr').each((index, element) => {
        const dataPeriodRaw = $(element).find('td').eq(1).text().trim(); // Get raw data period of monthly link
        const dataPeriodMatch = dataPeriodRaw.match(/(\d{4}-\d{2})/); // Extract the YYYY-MM part using regex
        const dataPeriod = dataPeriodMatch ? dataPeriodMatch[0] : null;
        //console.log(`Raw dataPeriod: "${dataPeriodRaw}", Extracted dataPeriod: "${dataPeriod}"`); // Debugging: Log raw and extracted dataPeriod

        if (dataPeriod) {
            const [yearStr, monthStr] = dataPeriod.split('-'); // Split the data period into year and month strings
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);

            //console.log(`Extracted year: ${year}, month: ${month}`); // Debugging: Log year and month

            if (!isNaN(year) && year >= MIN_YEAR) {
                let monthLink = $(element).find('td').eq(0).find('a').attr('href');
                if (monthLink) {
                    // Add link prefix
                    monthLink = BASE_ENROLL_URL + monthLink;
                    links.push({ url: monthLink, year, month });
                }
            }
        }
    });

    return links;
}

// Function to Get the Download Link from the Monthly Page
async function getDownloadLink(monthly) {
    const response = await axios.get(monthly.url);
    const $ = cheerio.load(response.data);
    const downloadLink = $('a[href$=".zip"]').attr('href'); // Adjust the selector based on actual HTML structure
    return BASE_ENROLL_URL + downloadLink;
}

// Main Function to Orchestrate the Process
async function main() {
    const links = await getMonthlyLinks();
    const downloadLinks = [];

    for (const monthly of links) {
        const downloadLink = await getDownloadLink(monthly);
        downloadLinks.push({ downloadLink, year: monthly.year, month: monthly.month });
    }

    console.log('Download links with periods:', downloadLinks);
}

main().catch(console.error);

