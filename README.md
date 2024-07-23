## ShinyFinder node.js script
Proof of Concept node.js project using image comparison using **pixelmatch** and synthetic inputs using **robotjs** that helps in the daunting task of shiny hunting in Pokemon games.

![Radical Red](https://github.com/user-attachments/assets/da43c61b-4ffd-48f2-9c1e-8bc3d33b0648)
:bulb: Screenshot taken from [Pokémon Radical Red](https://www.pokecommunity.com/threads/pok%C3%A9mon-radical-red-version-4-1-released-gen-9-dlc-pokemon-character-customization-now-available.437688/)

### How does it work?

The idea for this script is simple:

1. On Launch, position the game window in specified place, so the script captures the image of the pokemon you are searching for.
2. Confirm your choice.
3. The script moves and soft/hard resets the game so that you can encounter the Pokemon.
4. When script encounters a shiny, it will take a screenshot and display it in the console, and pause execution. Congrats, you found it! 

### Config
I wrote this script with my needs in mind, so the variables for screen position, keypresses and their delay require some fine-tuning depending on your setup. 
However the base idea and logic worked and allowed me to catch a shinies from:
- static encounters,
- dexNav,
- dynamax dens
- PC Method (Story Gift Pokemon)
- Code (Post-Game Code Redeemable Pokemon)
