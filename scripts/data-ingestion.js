const axios = require('axios');
const cheerio = require('cheerio');

const CMS_ENROLL_PARENT_URL = 'https://www.cms.gov/data-research/statistics-trends-and-reports/medicare-advantagepart-d-contract-and-enrollment-data/monthly-enrollment-contract/plan/state/county';
const BASE_ENROLL_URL = 'https://www.cms.gov';

async function getMonthlyLinks() {
    const response = await axios.get(CMS_ENROLL_PARENT_URL);
    const $ = cheerio.load(response.data);
    const links = [];

    $('table tr').each((index, element) => {
        let monthLink = $(element).find('td').eq(0).find('a').attr('href');
        if (monthLink) {
            // add link prefix...
            monthLink = BASE_ENROLL_URL + monthLink;
            links.push(monthLink);
        }
    });

    return links;

}

async function main() {
    const links = await getMonthlyLinks();
    console.log('Monthly links:', links);
}

main().catch(console.error);

