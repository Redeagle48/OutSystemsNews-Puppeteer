const puppeteer = require('puppeteer');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

async function getLastUpdateDateFromWeb() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://success.outsystems.com/Documentation/Whats_New');
    const result = await page.evaluate(() => {
        let date_day = document.querySelector('#elm-main-content > section > div > div.timeline-content > div:nth-child(1) > div.timeline-date > div.timeline-date-day').innerText;
        let date_year = document.querySelector('#elm-main-content > section > div > div.timeline-content > div:nth-child(1) > div.timeline-date > div.timeline-date-year').innerText;
        return {
            date_day,
            date_year
        }
    });

    browser.close();
    return result;
};

(async() => {
    const getLastReadUpdate = async() => {
        let readDate;
        try {
            let readDateString = await readFile("./lastChangeRead.json", { encoding: 'utf-8' });
            readDate = JSON.parse(readDateString);
        } catch (error) {
            console.error(`Something went wrong: ${error.message}`);
            //Set a far away time
            readDate = new Date(0, 0, 0);
        }

        return readDate;
    };

    //Get date of the last read with news
    const lastReadUpdate = await getLastReadUpdate();
    console.log(`Read: ${lastReadUpdate}`);
    console.log("Done");

    //Get the last date in the web page
    const result = await getLastUpdateDateFromWeb();
    console.log("Day and month: " + result.date_day);
    console.log("Year: " + result.date_year);

    function getMonthFromString(dayMonth) {
        return new Date(Date.parse(dayMonth + ", 2018")).getMonth();
    }

    function getMonthFromDate(date) {
        return date.getMonth() + 1;
    }

    var month = getMonthFromString(result.date_day);
    var day = result.date_day.split(decodeURI("%20"))[1];

    var currentReadDate = new Date(Date.UTC(result.date_year, month, day, 6));
    console.log(currentReadDate);

    //There is a newer update date?
    if (currentReadDate.getTime() > lastReadUpdate.getTime()) {
        //Notify there is something new in the what's new page
        /* TODO */

        //Write new date to file
        fs.writeFileSync("./lastChangeRead.json", JSON.stringify(currentReadDate), 'utf8');
    }
})();