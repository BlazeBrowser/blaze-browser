# blaze-browser
The source browser files that are downloaded and loaded in on launch and update

## Fixing broken install
Go to the Blaze application support / app data folder and updating the settings.json file string `version` to something different, this will make the core fetch the files again.

macOS: `/Users/username/Library/Application Support/Blaze` or just in finder click Go -> Go to folder... and enter in `~/Library/Application Support/Blaze`
Windows: `C:\Users\username\AppData` or in the location bar enter in `%appdata%` and you will be taken to the app data Roaming folder, just go back one folder level and click on Blaze.

## Manually change browser code
Browser code can be in the browsers application support / app data folder inside ``/src/browser`.
