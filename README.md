## Installation

Press `Ctrl+P` and type in `ext install Share Code`
 
## Usage

Press `Ctrl+Shift+P` and type in `Share Code`. Then you can select between Pastebin and GitHub Gist. *(anonymous)* means you haven't to login to share a file, but you can't edit or remove it later, when you choose this option.

HowTo upload a file to Pastebin:

![alt tag](https://raw.githubusercontent.com/tigerxy/VSCode-ShareCode/master/images/pastebinAym.gif)

HowTo upload a file to Github Gist:

![alt tag](https://raw.githubusercontent.com/tigerxy/VSCode-ShareCode/master/images/gistAym.gif)

## Settings
You can configure your Username. Go to `File > Preferences > User Settings` and add these Lines:

```
{
    "shareCode.pastebin.username":"YourUserName",
    "shareCode.gist.username":"YourUserName"
}
```

## Change Log
### Version 0.1.0
* Basic functions to share on Pastebin or GitHub Gist

## License
GPLv3
