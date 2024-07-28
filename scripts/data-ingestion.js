const axios = require('axios');
const cheerio = require('cheerio');
const unzipper = require('unzipper');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

const CMS_ENROLL_PARENT_URL = 'https://www.cms.gov/data-research/statistics-trends-and-reports/medicare-advantagepart-d-contract-and-enrollment-data/monthly-enrollment-contract/plan/state/county';
const BASE_ENROLL_URL = 'https://www.cms.gov';
const MIN_YEAR = 2020; 
const MONGO_URL = 'mongodb://mongo:27017'; // Your MongoDB connection string
const DB_NAME = 'enrollmentData';
const CONTRACT_COLLECTION = 'contractInfo';
const ENROLLMENT_COLLECTION = 'enrollmentInfo';

// Function: Gather All Monthly Enrollment Links from CMS and Ensure the Base URL Prefix is Added
async function getMonthlyLinks() {
    const response = await axios.get(CMS_ENROLL_PARENT_URL);
    const $ = cheerio.load(response.data);
    const links = [];

    $('table tr').each((index, element) => {
        const dataPeriodRaw = $(element).find('td').eq(1).text().trim(); // Get raw data period of monthly link
        const dataPeriodMatch = dataPeriodRaw.match(/(\d{4}-\d{2})/); // Extract the YYYY-MM part using regex
        const dataPeriod = dataPeriodMatch ? dataPeriodMatch[0] : null;

        if (dataPeriod) {
            const [yearStr, monthStr] = dataPeriod.split('-'); // Split the data period into year and month strings
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);

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

// Function to Download and Extract ZIP
async function downloadAndExtractZip(downloadLink) {
    const response = await axios({
        url: downloadLink,
        method: 'GET',
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        const chunks = [];
        response.data.on('data', chunk => chunks.push(chunk));
        response.data.on('end', () => resolve(Buffer.concat(chunks)));
        response.data.on('error', err => reject(err));
    });
}

// Function to Read and Transform Contract CSV
async function readAndTransformContractCsv(buffer, year, month) {
    const records = [];

    return new Promise((resolve, reject) => {
        const zip = unzipper.Open.buffer(buffer);
        zip.then(directory => {
            const contractFile = directory.files.find(file => file.path.includes('CPSC_Contract_Info') && file.path.endsWith('.csv'));
            if (!contractFile) {
                return reject(new Error('No CPSC_Contract_Info CSV file found in the ZIP archive'));
            }

            contractFile.stream()
                .pipe(csv({ headers: true, skipLines: 1 }))
                .on('data', (data) => {
                    data.year = year;
                    data.month = month;
                    records.push(data);
                })
                .on('end', () => {
                    resolve(records);
                })
                .on('error', (error) => {
                    reject(error);
                });
        }).catch(err => reject(err));
    });
}

// Function to Read and Transform Enrollment CSV
async function readAndTransformEnrollmentCsv(buffer, year, month) {
    const records = [];

    return new Promise((resolve, reject) => {
        const zip = unzipper.Open.buffer(buffer);
        zip.then(directory => {
            const enrollmentFile = directory.files.find(file => file.path.includes('CPSC_Enrollment_Info') && file.path.endsWith('.csv'));
            if (!enrollmentFile) {
                return reject(new Error('No CPSC_Enrollment_Info CSV file found in the ZIP archive'));
            }

            enrollmentFile.stream()
                .pipe(csv({ headers: true, skipLines: 1 }))
                .on('data', (data) => {
                    data.year = year;
                    data.month = month;
                    records.push(data);
                })
                .on('end', () => {
                    resolve(records);
                })
                .on('error', (error) => {
                    reject(error);
                });
        }).catch(err => reject(err));
    });
}

// Function to Insert Data into MongoDB
async function insertDataToMongo(records, collectionName) {
    const client = new MongoClient(MONGO_URL);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(collectionName);
        await collection.insertMany(records);
    } finally {
        await client.close();
    }
}

// Main Function to Orchestrate the Process
async function main() {
    const links = await getMonthlyLinks();
    const downloadLinks = [];

    for (const monthly of links) {
        const downloadLink = await getDownloadLink(monthly);
        downloadLinks.push({ downloadLink, year: monthly.year, month: monthly.month });
    }

    for (const { downloadLink, year, month } of downloadLinks) {
        const buffer = await downloadAndExtractZip(downloadLink);
        const contractRecords = await readAndTransformContractCsv(buffer, year, month);
        const enrollmentRecords = await readAndTransformEnrollmentCsv(buffer, year, month);
        
        await insertDataToMongo(contractRecords, CONTRACT_COLLECTION);
        await insertDataToMongo(enrollmentRecords, ENROLLMENT_COLLECTION);
    }

    console.log('Data ingestion complete.');
}

main().catch(console.error);