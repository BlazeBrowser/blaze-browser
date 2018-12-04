# blaze-browser
The source browser files that are downloaded and loaded in on launch and update

## Fixing broken install
Go to the Blaze application support / app data folder and updating the settings.json file string `version` to something different, this will make the core fetch the files again.

macOS: `/Users/username/Library/Application Support/Blaze` or just in finder click Go -> Go to folder... and enter in `~/Library/Application Support/Blaze`
Windows: `C:\Users\username\AppData` or in the location bar enter in `%appdata%` and you will be taken to the app data Roaming folder, just go back one folder level and click on Blaze.

## Manually change browser code
Browser code can be in the browsers application support / app data folder inside ``/src/browser``.

## Current deployment script to raw.blazebrowser.com

```
# CMDs working directory is the pipeline's filesystem with cloned repo
#Update blaze-browser brach MASTER
git config --global user.email "me@anthonys.space"
git config --global user.name "Anthony Rossbach"
BRANCH="master"
if [ -d "$BRANCH" ]; then
	cd ./$BRANCH
	git fetch
	HEADHASH=$(git rev-parse HEAD)
	UPSTREAMHASH=$(git rev-parse $BRANCH@{upstream})
	if [ "$HEADHASH" != "$UPSTREAMHASH" ]; then
		echo "Update needed... Downloading..."
		git pull
		LAST_COMMIT_HASH=$(git rev-parse HEAD)
		LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B --oneline)
		echo "{ \"version\": \"version_$LAST_COMMIT_HASH\", \"message\": \"$LAST_COMMIT_MESSAGE\" }" > ../$BRANCH\_version.json
	else
		echo "No update needed..."
	fi
else
	echo "No GIT found... Downloading..."
	git clone https://github.com/BlazeBrowser/blaze-browser.git -b $BRANCH --depth=1 --single-branch $BRANCH
	cd ./$BRANCH
	LAST_COMMIT_HASH=$(git rev-parse HEAD)
	LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B --oneline)
	echo "{ \"version\": \"version_$LAST_COMMIT_HASH\", \"message\": \"$LAST_COMMIT_MESSAGE\" }" > ../$BRANCH\_version.json
fi
#exit back to main folder
cd ../
BRANCH="beta"
if [ -d "$BRANCH" ]; then
	cd ./$BRANCH
	git fetch
	HEADHASH=$(git rev-parse HEAD)
	UPSTREAMHASH=$(git rev-parse $BRANCH@{upstream})
	if [ "$HEADHASH" != "$UPSTREAMHASH" ]; then
		echo "Update needed... Downloading..."
		git pull
		LAST_COMMIT_HASH=$(git rev-parse HEAD)
		LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B --oneline)
		echo "{ \"version\": \"version_$LAST_COMMIT_HASH\", \"message\": \"$LAST_COMMIT_MESSAGE\" }" > ../$BRANCH\_version.json
	else
		echo "No update needed..."
	fi
else
	echo "No GIT found... Downloading..."
	git clone https://github.com/BlazeBrowser/blaze-browser.git -b $BRANCH --depth=1 --single-branch $BRANCH
	cd ./$BRANCH
	LAST_COMMIT_HASH=$(git rev-parse HEAD)
	LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B --oneline)
	echo "{ \"version\": \"version_$LAST_COMMIT_HASH\", \"message\": \"$LAST_COMMIT_MESSAGE\" }" > ../$BRANCH\_version.json
fi
#exit back to main folder
cd ../
BRANCH="stable"
if [ -d "$BRANCH" ]; then
	cd ./$BRANCH
	git fetch
	HEADHASH=$(git rev-parse HEAD)
	UPSTREAMHASH=$(git rev-parse $BRANCH@{upstream})
	if [ "$HEADHASH" != "$UPSTREAMHASH" ]; then
		echo "Update needed... Downloading..."
		git pull
		LAST_COMMIT_HASH=$(git rev-parse HEAD)
		LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B --oneline)
		echo "{ \"version\": \"version_$LAST_COMMIT_HASH\", \"message\": \"$LAST_COMMIT_MESSAGE\" }" > ../$BRANCH\_version.json
	else
		echo "No update needed..."
	fi
else
	echo "No GIT found... Downloading..."
	git clone https://github.com/BlazeBrowser/blaze-browser.git -b $BRANCH --depth=1 --single-branch $BRANCH
	cd ./$BRANCH
	LAST_COMMIT_HASH=$(git rev-parse HEAD)
	LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B --oneline)
	echo "{ \"version\": \"version_$LAST_COMMIT_HASH\", \"message\": \"$LAST_COMMIT_MESSAGE\" }" > ../$BRANCH\_version.json
fi
#exit back to main folder
cd ../
```

## If you have questions
Feel free to reach out on Twitter https://www.twitter.com/anthonyrossbach
