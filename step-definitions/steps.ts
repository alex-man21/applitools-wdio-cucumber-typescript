import { Given, When, Then } from "@wdio/cucumber-framework";
import { expect, $ } from "@wdio/globals";

import LoginPage from "../pageObjects/login.page.js";
import ApplitoolEye from "../pageObjects/applitoolEye.page.js";

const pages = {
  login: LoginPage,
};

Given(/^user navigate to (.+) page$/, async (page) => {
  await LoginPage.open(page);
});

When(
  /^system configures Applitool Eye (.+) with AppName (.+) and test Name (.+)$/,
  async function (eye, appName, testName) {
    await ApplitoolEye.applitoolSetup();
    await ApplitoolEye.applitoolInit(appName, testName);
  }
);

When(/^system takes Visual Snapshot (.+)$/, async function (screenName) {
  await ApplitoolEye.applitoolTakeSnap(screenName);
});

Then(/^Close applitool eye/, async function () {
  await ApplitoolEye.closeApplitoolEye();
  await ApplitoolEye.postResult();
});
