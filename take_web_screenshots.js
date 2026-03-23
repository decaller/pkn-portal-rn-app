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

    // 16. Registration Detail
    console.log('Navigating to Registration Detail...');
    const regLink = page.locator('a[href*="/registrations/"]').first();
    if (await regLink.count() > 0) {
      await regLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/16_Registration_Detail.png' });
      console.log('Took 16_Registration_Detail.png');

      // 17. Cancel Dialog
      const cancelBtn = page.locator('text="Cancel"').last(); // The one in the footer
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/17_Cancel_Dialog.png' });
        console.log('Took 17_Cancel_Dialog.png');
        // Close alert by clicking "Cancel" in the native-like dialog (this might vary if it's a browser alert)
        // Since it's react-native-web + Alert.alert, it might be a window.confirm or a custom View.
        // Assuming it's a View from our Modal/View logic or browser confirm.
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }

      // 18. Change Package (Step 2 of Wizard)
      const changeBtn = page.locator('text="Change"').first();
      if (await changeBtn.count() > 0) {
        await changeBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/18_Change_Package.png' });
        console.log('Took 18_Change_Package.png');
        await page.goBack();
        await page.waitForTimeout(2000);
      }

      // 19. Add Participant Modal
      const addParticipantBtn = page.locator('text="Participants"').locator('..').locator('i, svg').first();
      // Or search for the add icon
      const addIcon = page.locator('[data-testid="add-participant-btn"]').first(); // I should have added testID
      // Let's try to find it by the Ionicons name if rendered as svg or text
      const addBtn = page.locator('text="Participants"').locator('..').locator('xpath=..').locator('i, svg, button').last();
      
      // Fallback: just try to click near the title
      await page.click('text="Participants"', { position: { x: 300, y: 10 } }); 
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/19_Add_Participant.png' });
      console.log('Took 19_Add_Participant.png');
      await page.keyboard.press('Escape');
    }

    // 20. Resume Wizard (via direct URL)
    console.log('Testing Resume Wizard...');
    await page.goto(url + '/events/1/register?step=3&regId=1', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/20_Resume_Wizard.png' });
    console.log('Took 20_Resume_Wizard.png');

  } else {
    console.log('Could not find login inputs.');
  }

  await browser.close();
  console.log('Done!');
})();
