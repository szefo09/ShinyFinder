const robot = require('robotjs');
const pixelmatch = require('pixelmatch');
const fs = require('fs');
const {
    Screenshots
} = require("node-screenshots");
const {
    basename
} = require('path');
const readline = require('readline');
const terminalImage = require('terminal-image');
const {
    type
} = require('os');
PNG = require("pngjs").PNG;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const screens = Screenshots.all();
const capturer = screens[screens.length - 1];
let retryCount = 0;
const pkmnPos = {
    x: 1493,
    y: 81,
    width: 211,
    height: 175
};
const playerPos = {
    x: 1241,
    y: 204,
    width: 150,
    height: 170
};
const pkmnBoxPos = {
    x: 1120,
    y: 100,
    width: 183,
    height: 183
};
//static,dexnav,den,pc
const currentEncounter = 'code'

function keypressSwitch(type) {
    switch (type) {
        case 'static':
            //reset game, spam A
            return [{
                key: 'r',
                modifier: "control",
                delayAfter: 160
            }, {
                key: 'z',
                modifier: null,
                delayAfter: 160
            }, {
                key: 'z',
                modifier: null,
                delayAfter: 105
            }, {
                key: 'z',
                modifier: null,
                delayAfter: 105
            }, {
                key: 'z',
                modifier: null,
                delayAfter: 105
            }, {
                key: 'z',
                modifier: null,
                delayAfter: 105
            }];
            break;
        case 'loadState':
            return [{
                key: 'f1',
                modifier: null,
                delayAfter: 40
            }]
            break;
        case 'saveState':
            return [{
                key: 'f1',
                modifier: 'shift',
                delayAfter: 40
            }]
            break;
        case 'changeSpeed':
            return [{
                key: 'tab',
                modifier: 'shift',
                delayAfter: 50
            }]
            break;
        case 'pressRB':
            return [{
                key: 's',
                modifier: null,
                delayAfter: 30
            }]
            break;
        case 'softReset':
            return [{
                key: 'r',
                modifier: 'control',
                delayAfter: 30
            }];
            break;
        case 'pressDown':
        case 'pressLeft':
        case 'pressRight':
        case 'pressUp':
            return [{
                key: type.replace('press', '').toLowerCase(),
                modifier: null,
                delayAfter: 35
            }];
            break;
        case 'pressB':
            return [{
                key: 'x',
                modifier: null,
                delayAfter: 35
            }]
            break;
        case 'pressA':
            return [{
                key: 'z',
                modifier: null,
                delayAfter: 35
            }];
            break;
        case 'pressStart':
            return [{
                key: 'enter',
                modifier: null,
                delayAfter: 35
            }];
            break;
        default:
            break;
    }
}

// Function to simulate keypresses with delays
function typeKeys(keys) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        robot.setKeyboardDelay(10);
        if (key.modifier != null) {
            
            robot.keyToggle(key.modifier, 'down');

            robot.keyTap(key.key);

            robot.keyToggle(key.modifier, 'up');
        } else {
            robot.keyTap(key.key);
        }
        // Adjust delay as per requirement
        robot.setKeyboardDelay(key.delayAfter); // Set a delay between keypresses
    }
}

async function waitForConfirmation() {
    return new Promise(resolve => {
        rl.question("Is this the correct spot? (Y/N) ", answer => {
            if (answer.toUpperCase() === 'Y' || answer.toUpperCase() === 'YES') {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

// Function to capture screenshot
async function captureRegion(pos) {
    let img = PNG.sync.read(await capturer.captureArea(pos.x, pos.y, pos.width, pos.height));
    return img;
}

// Function to compare screenshots
function areImagesDifferent(img1, img2, pos, options = {}) {
    let diffPNG = new PNG({
        width: pos.width,
        height: pos.height
    });
    let numDiffPixels = pixelmatch(img1.data, img2.data, diffPNG.data, pos.width, pos.height, options)
    return {
        isDifferent: numDiffPixels !== 0,
        val: numDiffPixels,
        diffPNG: diffPNG
    };
}

// shiny Hunter Static
async function shinyHunterStatic(pkmnImage) {
    // Simulate keypresses
    robot.setKeyboardDelay(40);
    typeKeys(keypressSwitch('static'));

    // Wait for keypresses to take effect
    await sleep(150);

    // Capture final screenshot
    let newPkmnImage = await captureRegion(pkmnPos);

    // Compare screenshots
    const difference = areImagesDifferent(pkmnImage, newPkmnImage, pkmnPos, {
        threshold: 0.1
    });

    await comparisionLogic(difference, shinyHunterStatic, pkmnImage, newPkmnImage);
}

// shiny Hunter DexNav
async function shinyHunterDexNav(pkmnImage, playerImage) {
    robot.setKeyboardDelay(25);
    // Simulate keypresses
    typeKeys(keypressSwitch("loadState"));

    let newPlayerImage = await captureRegion(playerPos);
    let walkDown = true;
    do {
        // typeKeys(keypressSwitch("pressB"));
        // typeKeys(keypressSwitch("pressRB"));
        // typeKeys(keypressSwitch("pressRB"));
        if (walkDown) {
            typeKeys(keypressSwitch("pressRight"));

        } else {
            typeKeys(keypressSwitch("pressLeft"));

        }
        walkDown = !walkDown;
        await sleep(150);
        newPlayerImage = await captureRegion(playerPos);
    } while (areImagesDifferent(playerImage, newPlayerImage, playerPos, {
            threshold: 0.1
        }).isDifferent);

    // Wait for keypresses to take effect
    await sleep(180);
    let newPkmnImage = await captureRegion(pkmnPos);

    // Compare screenshots
    const difference = areImagesDifferent(pkmnImage, newPkmnImage, pkmnPos, {
        threshold: 0
    });

    comparisionLogic(difference, shinyHunterDexNav, pkmnImage, newPkmnImage, playerImage);
}

//shiny Hunter Den
async function shinyHunterDen(pkmnImage) {
    // Simulate keypresses
    robot.setKeyboardDelay(40);
    typeKeys(keypressSwitch('softReset'));

    // Wait for keypresses to take effect
    await sleep(20);
    for (let index = 0; index < 10; index++) {
        typeKeys(keypressSwitch('pressA'));
    }
    typeKeys(keypressSwitch('changeSpeed'));
    await sleep(50);
    typeKeys(keypressSwitch('pressDown'));
    typeKeys(keypressSwitch('pressA'));
    typeKeys(keypressSwitch('pressA'));
    typeKeys(keypressSwitch('pressRight'));
    typeKeys(keypressSwitch('changeSpeed'));
    await sleep(50);
    typeKeys(keypressSwitch('pressA'));
    typeKeys(keypressSwitch('pressA'));
    typeKeys(keypressSwitch('pressA'));

    typeKeys(keypressSwitch('pressA'));
    typeKeys(keypressSwitch('pressA'));
    // Capture final screenshot
    let newPkmnImage = await captureRegion(pkmnPos);

    // Compare screenshots
    const difference = areImagesDifferent(pkmnImage, newPkmnImage, pkmnPos, {
        threshold: 0.1
    });

    await comparisionLogic(difference, shinyHunterDen, pkmnImage, newPkmnImage);
}

//shiny Hunter PC
async function shinyHunterPC(pkmnImage) {
    // Simulate keypresses
    robot.setKeyboardDelay(40);
    typeKeys(keypressSwitch('loadState'));
    typeKeys(keypressSwitch('pressA'));
    // Wait for keypresses to take effect
    await sleep(1000);
    for (let index = 0; index < 13; index++) {
        typeKeys(keypressSwitch('pressA'));
    }
    typeKeys(keypressSwitch('pressStart'));
    typeKeys(keypressSwitch('pressRight'));
    //typeKeys(keypressSwitch('changeSpeed'));
    typeKeys(keypressSwitch('pressDown'));
    //typeKeys(keypressSwitch('changeSpeed'));
    typeKeys(keypressSwitch('pressA'));
    await sleep(100);
    // Capture final screenshot
    let newPkmnImage = await captureRegion(pkmnBoxPos);

    // Compare screenshots
    const difference = areImagesDifferent(pkmnImage, newPkmnImage, pkmnBoxPos, {
        threshold: 0
    });
    if (difference.val >= 24000) {
        difference.isDifferent = false;
        typeKeys(keypressSwitch('softReset'));
    }
    await comparisionLogic(difference, shinyHunterPC, pkmnImage, newPkmnImage);
}

//shiny Hunter PC
async function shinyHunterCode(pkmnImage) {
    // Simulate keypresses
    robot.setKeyboardDelay(40);
    typeKeys(keypressSwitch('loadState'));
    await sleep(20);
    typeKeys(keypressSwitch('saveState'));
    typeKeys(keypressSwitch('pressA'));
    typeKeys(keypressSwitch('pressA'));
    // Wait for keypresses to take effect
    await sleep(100);

    typeKeys(keypressSwitch('pressStart'));
    typeKeys(keypressSwitch('pressRight'));
    //typeKeys(keypressSwitch('changeSpeed'));
    typeKeys(keypressSwitch('pressDown'));
    //typeKeys(keypressSwitch('changeSpeed'));
    typeKeys(keypressSwitch('pressA'));
    await sleep(100);
    // Capture final screenshot
    let newPkmnImage = await captureRegion(pkmnBoxPos);

    // Compare screenshots
    const difference = areImagesDifferent(pkmnImage, newPkmnImage, pkmnBoxPos, {
        threshold: 0
    });
    if (difference.val >= 25000) {
        difference.isDifferent = false;
        typeKeys(keypressSwitch('softReset'));
    }
    await comparisionLogic(difference, shinyHunterCode, pkmnImage, newPkmnImage);
}


async function comparisionLogic(difference, shinyHunter, pkmnImage, newPkmnImage, playerImage) {
    if (difference.isDifferent) {
        console.log('Shiny found!');
        await printImageToConsole(newPkmnImage);
        console.log("difference detected: ", difference.val);
        await printImageToConsole(difference.diffPNG);
    } else {
        retryCount += 1;
        console.log(`No shiny found. ${retryCount} Retry...`);

        await shinyHunter(pkmnImage, playerImage);
    }
}


async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}



async function printImageToConsole(img) {
    console.log(await terminalImage.buffer(PNG.sync.write(img), {
        width: '100%',
        height: '100%',
        preserveAspectRatio: true
    }));
}

async function staticEncounter() {
    console.log("Static Encounter Mode");
    console.log("Capturing a screenshot of Pokemon in 3 seconds.");
    await sleep(3000);

    let baseImage;
    do {
        baseImage = await captureRegion(pkmnPos);
        await printImageToConsole(baseImage);
    } while (!await waitForConfirmation());
    // const name = new Date().toLocaleTimeString().replaceAll(":","_")+".png";
    // fs.writeFileSync(`${name}`,PNG.sync.write(baseImage));
    rl.close();
    await sleep(2000);
    await shinyHunterStatic(baseImage);

}

async function denEncounter() {
    console.log("Den Encounter Mode");
    console.log("Capturing a screenshot of Pokemon in 1 seconds.");
    await sleep(1000);

    let baseImage;
    do {
        baseImage = await captureRegion(pkmnPos);
        await printImageToConsole(baseImage);
    } while (!await waitForConfirmation());
    // const name = new Date().toLocaleTimeString().replaceAll(":","_")+".png";
    // fs.writeFileSync(`${name}`,PNG.sync.write(baseImage));
    rl.close();
    await sleep(2000);
    await shinyHunterDen(baseImage);

}

async function dexNavEncounter() {
    console.log("DexNav Encounter Mode");
    console.log("Capturing a screenshot of Pokemon in 2 seconds.");
    await sleep(2000);

    let baseImage;
    do {
        baseImage = await captureRegion(pkmnPos);
        await printImageToConsole(baseImage);
    } while (!await waitForConfirmation());

    let playerImage;
    do {
        playerImage = await captureRegion(playerPos);
        await printImageToConsole(playerImage)
    } while (!await waitForConfirmation());
    rl.close();
    await sleep(2000);
    await shinyHunterDexNav(baseImage, playerImage);

}

async function PCEncounter() {
    console.log("PC Encounter Mode");
    console.log("Capturing a screenshot of Pokemon in 2 seconds.");
    await sleep(2000);

    let baseImage;
    do {
        baseImage = await captureRegion(pkmnBoxPos);
        await printImageToConsole(baseImage);
    } while (!await waitForConfirmation());
    rl.close();
    await sleep(2000);
    await shinyHunterPC(baseImage);

}

async function CodeEncounter() {
    console.log("Code Encounter Mode");
    console.log("Capturing a screenshot of Pokemon in 2 seconds.");
    await sleep(2000);

    let baseImage;
    do {
        baseImage = await captureRegion(pkmnBoxPos);
        await printImageToConsole(baseImage);
    } while (!await waitForConfirmation());
    rl.close();
    await sleep(2000);
    await shinyHunterCode(baseImage);

}


// Start shiny hunting
(async () => {
    console.log('////////////');
    switch (currentEncounter) {
        case 'static':
            await staticEncounter();
            break;
        case 'dexnav':
            await dexNavEncounter();
            break;
        case 'den':
            await denEncounter();
            break;
        case 'pc':
            await PCEncounter();
            break;
        case 'code':
            await CodeEncounter();
            break;
    }

})();