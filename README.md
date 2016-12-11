[![](http://vsmarketplacebadge.apphb.com/version-short/RolandGreim.sharecode.svg)](https://marketplace.visualstudio.com/items?itemName=RolandGreim.sharecode)
[![](http://vsmarketplacebadge.apphb.com/installs-short/RolandGreim.sharecode.svg)](https://marketplace.visualstudio.com/items?itemName=RolandGreim.sharecode)

## Features
### Supports on Pastebin and Github Gist
* share code
* open shared files
* login with oauth

### Supports on GitLab
* share code
* open shared files

Please create a [Personal Access Tokens](https://gitlab.com/profile/personal_access_tokens) by hand

### Usability
* select text for sharing
* context menus

## Usage

Press `Ctrl+Shift+P` and type in `Share Code`. Then you can select between Pastebin and GitHub Gist. *(anonymous)* means you don't have to login to share a file, but you can't edit or remove it later, when you choose this option.

HowTo upload a file to Pastebin:

![alt tag](https://raw.githubusercontent.com/tigerxy/VSCode-ShareCode/master/images/pastebinAym.gif)

HowTo upload a file to Github Gist:

![alt tag](https://raw.githubusercontent.com/tigerxy/VSCode-ShareCode/master/images/gistAym.gif)

## Settings
These settings are set automatically when you start the extension. You can also manually configure your user name and token. Go to `File > Preferences > User Settings` and add these lines:
```
{
    "shareCode.pastebin.username": "...",
    "shareCode.pastebin.authtoken": "...",
    "shareCode.github.username": "...",
    "shareCode.github.authtoken": "..."
}
```
## Reset Github token
Sometimes it is necessary to delete a token. Go to this [page](https://github.com/settings/tokens) and delete the token named `VSCode Share Code`.

## License
GPLv3