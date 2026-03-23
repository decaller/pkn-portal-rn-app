const { chromium } = require('/tmp/playwright/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  const url = 'http://localhost:8082';
  
  // 1. Greetings Page
  console.log("Navigating to " + url + " for Greetings Page");
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/01_Greetings_Page.png' });
  console.log('Took 01_Greetings_Page.png');

  // Click "Get Started" to go to Public Dashboard
  const getStartedBtn = page.locator('text="Get Started"').first();
  if (await getStartedBtn.count() > 0) {
    await getStartedBtn.click();
    await page.waitForTimeout(3000);
  }

  // 2. Public Dashboard
  await page.screenshot({ path: 'screenshots/02_Public_Dashboard.png' });
  console.log('Took 02_Public_Dashboard.png');

  // 3. Events List
  await page.goto(url + '/events', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/03_Events_List.png' });
  console.log('Took 03_Events_List.png');

  // 4. Event Detail
  const eventLinks = await page.$$('a[href*="/events/"]');
  if (eventLinks.length > 0) {
    await eventLinks[0].click();
  } else {
    await page.goto(url + '/events/1', { waitUntil: 'networkidle', timeout: 30000 });
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/04_Event_Detail.png' });
  console.log('Took 04_Event_Detail.png');

  // 5. News List
  await page.goto(url + '/news', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/05_News_List.png' });
  console.log('Took 05_News_List.png');

  // 6. News Detail
  const newsLinks = await page.$$('a[href*="/news/"]');
  if (newsLinks.length > 0) {
    await newsLinks[0].click();
  } else {
    await page.goto(url + '/news/1', { waitUntil: 'networkidle', timeout: 30000 });
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/06_News_Detail.png' });
  console.log('Took 06_News_Detail.png');

  // 7. Documents List
  await page.goto(url + '/documents', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/07_Documents_List.png' });
  console.log('Took 07_Documents_List.png');

  // 8. Registrations List (Guest)
  await page.goto(url + '/registrations', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/08_Registrations_Guest.png' });
  console.log('Took 08_Registrations_Guest.png');

  // 9. Login Flow
  await page.goto(url + '/auth/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/09_Login_Screen.png' });
  console.log('Took 09_Login_Screen.png');

  const phoneInputSelector = 'input[placeholder="e.g. 08123456789"]';
  if (await page.locator(phoneInputSelector).count() > 0) {
    await page.fill(phoneInputSelector, '081100000002');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/10_Phone_Input.png' });
    console.log('Took 10_Phone_Input.png');

    const passwordInputSelector = 'input[placeholder="Enter your password"]';
    await page.fill(passwordInputSelector, 'password123');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/11_Password_Input.png' });
    console.log('Took 11_Password_Input.png');

    await page.screenshot({ path: 'screenshots/12_Login_Clicked.png' });
    console.log('Took 12_Login_Clicked.png');

    const signInBtn = page.locator('text="Sign In"').first();
    if (await signInBtn.count() > 0) {
      await signInBtn.click();
    }
    
    console.log('Waiting for Dashboard post-login...');
    await page.waitForTimeout(6000);

    // 13. Auth Dashboard
    await page.screenshot({ path: 'screenshots/13_Auth_Dashboard.png' });
    console.log('Took 13_Auth_Dashboard.png');

    // 14. Auth Registrations
    await page.goto(url + '/registrations', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/14_Registrations_Auth.png' });
    console.log('Took 14_Registrations_Auth.png');

    // 15. Profile
    await page.goto(url + '/profile', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/15_Profile_Screen.png' });
    console.log('Took 15_Profile_Screen.png');

  } else {
    console.log('Could not find login inputs.');
  }

  await browser.close();
  console.log('Done!');
})();
