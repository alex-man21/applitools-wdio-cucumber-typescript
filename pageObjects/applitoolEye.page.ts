import { $ } from "@wdio/globals";
import Page from "./page.js";
import { remote } from "webdriverio";
import {
  Eyes,
  ClassicRunner,
  VisualGridRunner,
  RunnerOptions,
  Target,
  RectangleSize,
  Configuration,
  BatchInfo,
  BrowserType,
  ScreenOrientation,
  DeviceName,
  ConsoleLogHandler
} from "@applitools/eyes-webdriverio";

/**
 * sub page containing specific selectors and methods for a specific page
 */
class ApplitoolEye extends Page {
  USE_ULTRAFAST_GRID = true;
  USE_EXECUTION_CLOUD = false;

  // Test control inputs to read once and share for all tests
  applitoolsApiKey;

  // Applitools objects to share for all tests
  batch;
  config;
  runner;

  // Test-specific objects
  eyes;

  public async applitoolSetup() {
    // This method sets up the configuration for running visual tests.
    // The configuration is shared by all tests in a test suite, so it belongs in a `before` method.
    // If you have more than one test class, then you should abstract this configuration to avoid duplication.

    // Read the Applitools API key from an environment variable.
    // To find your Applitools API key:
    // https://applitools.com/tutorials/getting-started/setting-up-your-environment.html
    this.applitoolsApiKey = process.env.APPLITOOLS_API_KEY;
    this.eyes = new Eyes(this.runner);

    if (this.USE_ULTRAFAST_GRID) {
      // Create the runner for the Ultrafast Grid.
      // Concurrency refers to the number of visual checkpoints Applitools will perform in parallel.
      // Warning: If you have a free account, then concurrency will be limited to 1.
      this.runner = new VisualGridRunner(RunnerOptions().testConcurrency(5));
    } else {
      // Create the classic runner.
      this.runner = new ClassicRunner();
    }

    // Create a new batch for tests.
    // A batch is the collection of visual checkpoints for a test suite.
    // Batches are displayed in the Eyes Test Manager, so use meaningful names.
    const runnerName = this.USE_ULTRAFAST_GRID
      ? "Ultrafast Grid"
      : "Classic runner";
    this.batch = new BatchInfo(
      `Example: WebdriverIO JavaScript with the ${runnerName}`
    );

    // Create a configuration for Applitools Eyes.
    this.config = new Configuration();

    // Set the Applitools API key so test results are uploaded to your account.
    // If you don't explicitly set the API key with this call,
    // then the SDK will automatically read the `APPLITOOLS_API_KEY` environment variable to fetch it.
    this.config.setApiKey(this.applitoolsApiKey);

    // Set the batch for the config.
    this.config.setBatch(this.batch);

    if (this.USE_ULTRAFAST_GRID) {
      // Add 3 desktop browsers with different viewports for cross-browser testing in the Ultrafast Grid.
      // Other browsers are also available, like Edge and IE.
      this.config.addBrowser(800, 600, BrowserType.CHROME);
      this.config.addBrowser(1600, 1200, BrowserType.FIREFOX);
      this.config.addBrowser(1024, 768, BrowserType.SAFARI);

      // Add 2 mobile emulation devices with different orientations for cross-browser testing in the Ultrafast Grid.
      // Other mobile devices are available, including iOS.
      this.config.addDeviceEmulation(
        DeviceName.Pixel_2,
        ScreenOrientation.PORTRAIT
      );
      this.config.addDeviceEmulation(
        DeviceName.Nexus_10,
        ScreenOrientation.LANDSCAPE
      );
    }
  }

  async applitoolInit(appName: string, testName: string) {
    // This method sets up each test with its own ChromeDriver and Applitools Eyes objects.
    // Even though this test will run visual checkpoints on different browsers in the Ultrafast Grid,
    // it still needs to run the test one time locally to capture snapshots.

    // Create the Applitools Eyes object connected to the runner and set its configuration.

    this.eyes.setConfiguration(this.config);
    this.eyes.setLogHandler(new ConsoleLogHandler(true));

    // Set up Execution Cloud if it will be used.
    if (this.USE_EXECUTION_CLOUD) {
      const executionCloudUrl = new URL(await Eyes.getExecutionCloudUrl());
      const protocol_val = executionCloudUrl.protocol.substring(
        0,
        executionCloudUrl.protocol.length - 1
      );
      browser = await remote({
        logLevel: "trace",
        protocol: protocol_val,
        hostname: executionCloudUrl.hostname,
        port: Number(executionCloudUrl.port),
        capabilities: {
          browserName: "chrome",
        },
      });
    }

    // Open Eyes to start visual testing.
    // It is a recommended practice to set all four inputs:
    console.log("a->" + appName);
    console.log("b->" + testName);
    browser = await this.eyes.open(
      // WebDriver object to "watch".
      browser,

      // The name of the application under test.
      // All tests for the same app should share the same app name.
      // Set this name wisely: Applitools features rely on a shared app name across tests.
      appName,

      // The name of the test case for the given application.
      // Additional unique characteristics of the test may also be specified as part of the test name,
      // such as localization information ("Home Page - EN") or different user permissions ("Login by admin").
      testName,

      // The viewport size for the local browser.
      // Eyes will resize the web browser to match the requested viewport size.
      // This parameter is optional but encouraged in order to produce consistent results.
      (1200, 600)
    );
  }

  async applitoolTakeSnap(pageName) {
    // This test covers login for the Applitools demo site, which is a dummy banking app.
    // The interactions use typical Selenium calls,
    // but the verifications use one-line snapshot calls with Applitools Eyes.
    // If the page ever changes, then Applitools will detect the changes and highlight them in the Eyes Test Manager.
    // Traditional assertions that scrape the page for text values are not needed here.

    await this.eyes.check(Target.window().fully().withName(pageName));
  }

  async closeApplitoolEye() {
    // Close Eyes to tell the server it should display the results.
    await this.eyes.close();

    // Quit the WebdriverIO instance
    await browser.closeWindow();

    // Warning: `eyes.closeAsync()` will NOT wait for visual checkpoints to complete.
    // You will need to check the Eyes Test Manager for visual results per checkpoint.
    // Note that "unresolved" and "failed" visual checkpoints will not cause the Mocha test to fail.

    // If you want the ACME demo app test to wait synchronously for all checkpoints to complete, then use `eyes.close()`.
    // If any checkpoints are unresolved or failed, then `eyes.close()` will make the ACME demo app test fail.
  }

  async postResult() {
    await this.eyes.abort();
    
    // Close the batch and report visual differences to the console.
    // Note that it forces Mocha to wait synchronously for all visual checkpoints to complete.
    const allTestResults = await this.runner.getAllTestResults();
    console.log(allTestResults);
  }
}
export default new ApplitoolEye();
