const randomstring = require('randomstring');
const puppeteer = require('puppeteer-extra');

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: '03637d889f98853fc74398c9f0bb0ac6' 
        },
        visualFeedback: true
    })
)

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

//generate random number
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandEmail() {
    return randomstring.generate((getRandomInt(6, 11))) + '+' + getRandomInt(1, 20).toString() + '@gmail.com'
}

function getRandPass() {
    return randomstring.generate((getRandomInt(9, 12)))
}

let sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

module.exports = {
    generate: genAcc,
    pgenerate: parser,


}

async function genAcc(user, pass) {
   // if (proxy && port) {
        let loginUser;
        let loginPass;
        //Puppeteer settings
        const browser = await puppeteer.launch({
            //VVV COMMENT FOR PROXYLESS (FOR TESTS)
            args: [
                '--disable-features=IsolateOrigins,site-per-process',
                '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
               // '--proxy-server=' + proxy + ':' + port
                 ],
            headless: false,
        })

        //Proxy authentication
        let [page] = await browser.pages();
        await page.authenticate({
            username: user,
            password: pass,
        })

        async function checkAndSolve(){
            if (await page.$('#cf-hcaptcha-container') != null ){
                console.log('Captcha Detected')
                console.log('Solving Captcha')
                await page.solveRecaptchas();
                console.log('Solved!')
                await sleep(3000,4000)
                await checkAndSolve()


            }



        }


        async function loadPage() {
        
            //Finds cookie screen and clicks deny
            async function denyCookies() {
                await page.waitForSelector('#CybotCookiebotDialogBodyButtonDecline', {hidden: false});
                await sleep(getRandomInt(1, 2));
                await page.click('#CybotCookiebotDialogBodyButtonDecline');
                await page.waitForSelector('#CybotCookiebotDialogBodyButtonDecline', {hidden: true});
            }

            //Goes to page and removes cookie dialogues
            await page.goto('https://www.runescape.com/');
            const pageTarget = page.target();
            // await denyCookies()



            //check for which splash page
            if (await page.$('#dual-branded-hero-header > div.css-18qwgab > div.css-12uqql7 > div > div > a:nth-child(2)') != null ){
                await sleep(getRandomInt(1, 2));
                await page.click("#dual-branded-hero-header > div.css-18qwgab > div.css-12uqql7 > div > div > a:nth-child(2)")
                const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
                page = await newTarget.page();
                await sleep(getRandomInt(3000,4000))
                await checkAndSolve()

                


            /* }else if(await page.$('#inner-wrap > div.main > section.banner > div > div > nav > a.cta.cta-splash.create') != null ){
                await sleep(getRandomInt(1,2));
                await page.click("#inner-wrap > div.main > section.banner > div > div > nav > a.cta.cta-splash.create")
                await page.waitForNavigation()
                await sleep(getRandomInt(3000,4000))
                await checkAndSolve()
*/
            }else{
                console.log('Unrecognised Splash')
            }
        } 


        async function createAccount() {

            async function createUser(generatedUser) {
                await sleep(getRandomInt(1, 2))
                await page.click("#create-email", {clickCount: 3})
                await sleep(getRandomInt(1, 2))
                loginUser = await page.keyboard.type(generatedUser, {delay: getRandomInt(1, 2)})
            }

            async function createPass(generatedPass) {
                //input password

                //wait for rand seconds, click password box
                await sleep(getRandomInt(1, 2))
                await page.click("#create-password", {clickCount: 3})

                //wait rand seconds, type password
                await sleep(getRandomInt(1, 2))
                loginPass = await page.keyboard.type(generatedPass, {delay: getRandomInt(1, 2)})
            }

            async function inputDates() {
                //input dates
                //wait rand seconds, click day, enter day between 1 and 29
                await sleep(getRandomInt(1, 2))
                await page.click('#create-email-form > fieldset > div > label:nth-child(1) > input', {clickCount: 3})
                await page.keyboard.type(getRandomInt(1, 29).toString(), {delay: getRandomInt(1, 2)})

                //wait rand seconds, click month, enter month between 1 and 12
                await sleep(getRandomInt(1, 2))
                await page.click('#create-email-form > fieldset > div > label:nth-child(2) > input', {clickCount: 3})
                await page.keyboard.type(getRandomInt(1, 12).toString(), {delay: getRandomInt(1, 2)})

                //wait rand seconds, click year, enter year between 1987 and 2001
                await sleep(getRandomInt(1, 2))
                await page.click('#create-email-form > fieldset > div > label:nth-child(3) > input', {clickCount: 3})
                await page.keyboard.type(getRandomInt(1987, 2001).toString(), {delay: getRandomInt(1, 2)})
            }

            async function acceptPlay() {
                //wait rand seconds, accept terms, wait rand seconds, click play
                await sleep(getRandomInt(1, 2))
                await page.click('#create-email-form > label:nth-child(10) > div > input');
                await sleep(getRandomInt(1, 2))
                await page.click('#create-submit')
                await sleep(getRandomInt(3000, 4000))
                await checkAndSolve()
                await sleep(getRandomInt(3000, 4000))
            }

            async function checkIfSuccess() {
                if (await page.$('#p-account-created' != null)) {
                console.log('Succcess!')
                } else if (userpass == user) {
                //yee
                } else {
                await checkAndSolve()
                }
        }



            await sleep(getRandomInt(1, 2))
            await page.click('#app > div > div > div > div > div:nth-child(5)');
            await denyCookies()
            await createUser(getRandEmail())
            await inputDates()
            await createPass(getRandPass())
            await acceptPlay()



        }

        await loadPage()
        await createAccount()
        console.log(loginUser, loginPass)
    



}

async function parser(string) {
    const args = string.split(':');
    await console.log('Parsed: ' + string, '\n' + "Into: " + args)
    return await genAcc(...args)

}
