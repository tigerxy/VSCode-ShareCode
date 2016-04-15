'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {sharecode} from './sharecode';
let i18next = require('i18next');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "Share Code" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.shareCode', () =>
    {
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
                            "description":"Description of your file"
                        },
                        "publishedMessage": "Your File is published here: ",
                        "fileNotFound": "No file for sharing found. Please open one in edit mode.",
                        "public": "public",
                        "unlisted": "unlisted",
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
                            "description":"Beschreibung der Datei"
                        },
                        "publishedMessage": "Deine Datei wurde hier veröffentlicht: ",
                        "fileNotFound": "Keine Detei zum teilen gefunden. Bitte öffnen Sie eine im Bearbeitungsmodus.",
                        "public": "öffentlich",
                        "unlisted": "nicht gelistet",
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
        // The code you place here will be executed every time your command is executed
        // Convert fullpath to filename
        if (vscode.window.activeTextEditor != null)
        {
            let sc = new sharecode.sharecode()
            sc.start()
        } else
        {
            vscode.window.showErrorMessage(i18next.t("fileNotFound"))
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate()
{
}