
# ServerSwitch

**A Chrome Extension for folks who are tired of juggling between dev, test, and live environments.**

## Why This Exists

Ever feel like you spend half your day copy-pasting URLs, changing subdomains or ports, and praying you don’t accidentally go to production? Same. This extension was born out of that frustration: a single click (or Ctrl-click) to jump between environments without fat-fingering your URL bar.

## Installation

1.  Download or clone this repository.
2.  Go to **chrome://extensions** in your Chrome browser.
3.  Enable **Developer mode** (toggle in the top-right corner).
4.  Click **Load unpacked** and select this project folder.

That’s it! You should see the little toggle icon in your extensions area.

## Usage

-   **Click** the icon. If your current site’s domain matches one of your defined environments, you’ll see a list of available servers (DEV, TEST, LIVE, etc.).
-   **Click** an environment to switch in the same tab, or **Ctrl-click** (Cmd-click on Mac, or middle-click, or right-click) to open in a new tab.
-   If you don’t have an environment set up for your current domain, you’ll see “No multidev environments detected.” You can quickly jump to the Options page and add one.
-  **Optional** - Pin the extension to your toolbar for easy access.

### Pro Tips

-   You can reorder environments or edit their domains in the Options page.
-   The extension icon will look like it’s switched **ON** (toggle-on) if you’re on a recognized domain, and **OFF** (toggle-off) otherwise.
-   Because this extension is super specialized, it’s not in the Chrome Web Store (yet). If it magically gets more than 1,000 stars here on GitHub, I’ll publish it. 

## Contributing

If you see a bug or want to add a feature, open a PR or file an issue. If you want to complain about how you break into hives every time you see the word “multidev,” you can do that too.

----------

**Happy server switching!** Go forth and dev/test/live your heart out with fewer keystrokes.