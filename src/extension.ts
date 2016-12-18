'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ShareCode, ShareCodeClasses } from './sharecode';
let i18next = require('i18next');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "Share Code" is now active!');
    i18next.init({
        "debug": false,
        "lng": vscode.env.language,
        "resources": {
            "en-US": {
                "translation": {
                    "pastebin": {
                        "service": "Pastebin",
                        "serviceAnym": "Pastebin (anonymous)",
                        "choosePrivacy": "Choose privacy",
                        "chooseExpireDate": "Choose expire date",
                        "username": "Pastebin Username",
                        "password": "Pastebin Password"
                    },
                    "github": {
                        "service": "GitHub Gist",
                        "serviceAnym": "GitHub Gist (anonymous)",
                        "username": "GitHub Username",
                        "password": "GitHub Password",
                        "description": "Description of your file",
                        "errors": {
                            "tokenExist": "Authtoken already exist. Please delete it on Github: https://github.com/settings/tokens"
                        }
                    },
                    "gitlab": {
                        "service": "GitLab",
                        "public": "The snippet can be accessed without any authentication",
                        "internal": "The snippet is visible for any logged in user",
                        "private": "The snippet is visible only the snippet creator",
                        "select": {
                            "project": "select project",
                            "snippet": "select snippet"
                        },
                        "token": {
                            "generate": "Go to this {{url}}profile/personal_access_tokens page and generate a access token and insert it.",
                            "baseUrl": "Insert url of your gitlab server."
                        }
                    },
                    "zerobin": {
                        "service": "ZeroBin"
                    },
                    "errors": {
                        "tokenWrongOrExpired": "Token is wrong or expired. Please renew it.",
                        "blankUsernameOrPassword": "Username or password can not be blank.",
                        "unexpectedErrorCode": "An unexpected error occurred. Please contact the developer. Code: {{code}}",
                        "noDescription": "No description"
                    },
                    "publishedMessage": "Your File is published here: ",
                    "fileNotFound": "No file for sharing found. Please open one in edit mode.",
                    "public": "public",
                    "unlisted": "unlisted",
                    "internal": "internal",
                    "private": "private",
                    "never": "never",
                    "minute": "{{count}} minute",
                    "minute_plural": "{{count}} minutes",
                    "hour": "{{count}} hour",
                    "day": "{{count}} day",
                    "week": "{{count}} week",
                    "week_plural": "{{count}} weeks",
                    "month": "{{count}} month"
                }
            },
            "de": {
                "translation": {
                    "pastebin": {
                        "service": "Pastebin",
                        "serviceAnym": "Pastebin (anonym)",
                        "choosePrivacy": "Sichtbarkeit auswählen",
                        "chooseExpireDate": "Ablaufdatum auswählen",
                        "username": "Pastebin Benutzername",
                        "password": "Pastebin Passwort"
                    },
                    "github": {
                        "service": "GitHub Gist",
                        "serviceAnym": "GitHub Gist (anonym)",
                        "username": "GitHub Benutzername",
                        "password": "GitHub Passwort",
                        "description": "Beschreibung der Datei",
                        "errors": {
                            "tokenExist": "Anmelde-Token wurde bereits erstellt. Bitte diesen auf Github löschen: https://github.com/settings/tokens"
                        }
                    },
                    "gitlab": {
                        "service": "GitLab",
                        "public": "The snippet can be accessed without any authentication",
                        "internal": "The snippet is visible for any logged in user",
                        "private": "The snippet is visible only the snippet creator",
                        "select": {
                            "project": "Projekt auswählen",
                            "snippet": "Snippet auswählen"
                        },
                        "token": {
                            "generate": "Go to this {{url}}profile/personal_access_tokens page and generate a access token and insert it.",
                            "baseUrl": "Insert url of your gitlab server."
                        }
                    },
                    "zerobin": {
                        "service": "ZeroBin"
                    },
                    "errors": {
                        "tokenWrongOrExpired": "Token ist falsch oder abgelaufen. Bitte neuen einstellen.",
                        "blankUsernameOrPassword": "Benutzername oder Passwort dürfen nicht leer sein.",
                        "unexpectedErrorCode": "Ein unerwarteter Fehler ist aufgetreten. Bitte kontaktieren sie den Entwickler. Code: {{code}}",
                        "noDescription": "Keine Beschreibung"
                    },
                    "publishedMessage": "Deine Datei wurde hier veröffentlicht: ",
                    "fileNotFound": "Keine Detei zum teilen gefunden. Bitte öffnen Sie eine im Bearbeitungsmodus.",
                    "public": "öffentlich",
                    "unlisted": "nicht gelistet",
                    "internal": "intern",
                    "private": "privat",
                    "never": "niemals",
                    "minute": "{{count}} Minute",
                    "minute_plural": "{{count}} Minuten",
                    "hour": "{{count}} Stunde",
                    "day": "{{count}} Tag",
                    "week": "{{count}} Woche",
                    "week_plural": "{{count}} Wochen",
                    "month": "{{count}} Monat"
                }
            }
        },
        "fallbackLng": "en-US"
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let share = vscode.commands.registerCommand("extension.shareCode.share", () =>
    {
        // The code you place here will be executed every time your command is executed
        // Convert fullpath to filename
        if (vscode.window.activeTextEditor != null)
        {
            let sc = new ShareCode.ShareCode()
            sc.share()
        } else
        {
            vscode.window.showErrorMessage(i18next.t("fileNotFound"))
        }
    });

    let open = vscode.commands.registerCommand("extension.shareCode.open", () =>
    {
        // The code you place here will be executed every time your command is executed
        // Convert fullpath to filename
        let sc = new ShareCode.ShareCode()
        sc.open()
    });

    context.subscriptions.push(share, open)
}

// this method is called when your extension is deactivated
export function deactivate()
{ }