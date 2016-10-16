import * as vscode from 'vscode';
import {ShareCodeClasses} from './sharecode';
let GitHubApi = require("github");
let request = require("request");
let i18next = require('i18next');
let fs = require('fs');
let _ = require('underscore');

export module github
{
    enum privacySelection
    {
        public,
        private
    }

    interface privacyQuickPick extends vscode.QuickPickItem
    {
        id: privacySelection
    }

    export class github implements ShareCodeClasses.Service
    {
        private client
        private userName: string = null
        private userPass: string = null
        private configuration: ShareCodeClasses.Configuration
        private dateTimeHandler: ShareCodeClasses.dateTime
        private fileHandler: ShareCodeClasses.tmpFile
        private description: string

        constructor()
        {
            this.configuration = new ShareCodeClasses.Configuration('github')
            this.fileHandler = new ShareCodeClasses.tmpFile('github')
            this.dateTimeHandler = new ShareCodeClasses.dateTime()
            this.client = new GitHubApi({
                // required
                version: "3.0.0",
                // optional
                protocol: "https",
                headers: {
                    "user-agent": "VSCode-ShareCode" // GitHub is happy with a unique user agent
                }
            });
        }

        public upload(fileToUpload: ShareCodeClasses.file, defaults: boolean = false): Promise<string>
        {
            if (!defaults)
            {
                return this.auth().then(() =>
                {
                    return this.uploadFile(fileToUpload)
                });
            }
            else
            {
                return this.uploadFile(fileToUpload)
            }
        }

        public open(): Promise<string>
        {
            return new Promise((resolve) =>
            {
                this.auth().then(() =>
                {
                    this.client.gists.getForUser({
                        owner: this.configuration.get('username')
                    }, (err, res) =>
                        {
                            let gists = res.map(gist =>
                            {
                                let files: string = _.keys(gist.files).join(", ")
                                let desc = gist.description
                                if (desc == "")
                                {
                                    desc = i18next.t("errors.noDescription")
                                }
                                return {
                                    label: desc,
                                    detail: files,
                                    description: this.dateTimeHandler.getDate(gist.updated_at),
                                    gistId: gist.id
                                }
                            })
                            vscode.window.showQuickPick(gists).then((selected: any) =>
                            {
                                if (selected != undefined)
                                {
                                    this.client.gists.get({
                                        id: selected.gistId
                                    }, (err, res) =>
                                        {
                                            _.each(res.files, (gist) =>
                                            {
                                                this.fileHandler.saveFile(selected.gistId, gist.filename, gist.content)
                                                vscode.workspace.openTextDocument(this.fileHandler.getFilePath(selected.gistId, gist.filename))
                                                    .then((doc: vscode.TextDocument) =>
                                                    {
                                                        vscode.window.showTextDocument(doc)
                                                    });
                                            })
                                            resolve()
                                        })
                                }
                            })
                        })
                })
            })
        }

        private auth(): Promise<string>
        {
            return new Promise((resolve) =>
            {
                if (this.configuration.get("authtoken") == null)
                {
                    this.authPromt().then(() =>
                    {
                        this.client.authorization.create(
                            {
                                scopes: ["gist"],
                                note: "VSCode Share Code",
                                note_url: "https://marketplace.visualstudio.com/items?itemName=RolandGreim.sharecode",
                                headers: {}
                            },
                            (err, res) =>
                            {
                                if (err != null)
                                {
                                    this.showErrorMessage(err.code)
                                }
                                else
                                {
                                    if (res.token)
                                    {
                                        //save and use res.token as in the Oauth process above from now on
                                        this.configuration.set("authtoken", res.token)
                                        resolve()
                                    }
                                }
                            }
                        )
                    })
                }
                else
                {
                    this.client.authenticate({
                        type: "oauth",
                        token: this.configuration.get("authtoken")
                    })
                    resolve()
                }
            })
        }

        private authPromt(): Promise<any>
        {
            return new Promise((resolve) =>
            {
                vscode.window.showInputBox({
                    placeHolder: i18next.t("github.username"),
                    value: this.configuration.get('username')
                }).then((userName: string) =>
                {
                    vscode.window.showInputBox({
                        placeHolder: i18next.t("github.password"),
                        password: true
                    }).then((userPass: string) =>
                    {
                        if (userName == "" || userPass == "")
                        {
                            this.showErrorMessage(10000)
                        } else
                        {
                            this.configuration.set('username', userName)
                            this.client.authenticate({
                                type: "basic",
                                username: userName,
                                password: userPass
                            });

                            resolve()
                        }
                    })
                })
            })
        }

        private uploadFile(fileToUpload: ShareCodeClasses.file): Promise<string>
        {
            return new Promise<string>((resolve) =>
            {
                vscode.window.showQuickPick(this.getPrivacyQuickPickItems(), {
                    placeHolder: i18next.t('pastebin.choosePrivacy')
                }
                ).then(
                    (privacy: privacyQuickPick) =>
                    {
                        vscode.window.showInputBox({
                            placeHolder: i18next.t("github.description")
                        }).then((desc: string) =>
                        {
                            let data = {
                                "description": this.description,
                                "public": privacy.id == privacySelection.public,
                                "files": {}
                            }
                            data.files[fileToUpload.fileName] = { "content": fileToUpload.code };

                            this.client.gists.create(
                                data,
                                (err, res) =>
                                {
                                    resolve(res.html_url)
                                }
                            )
                        })
                    })
            })
        }

        private getPrivacyQuickPickItems(): Array<privacyQuickPick>
        {
            return [
                {
                    id: privacySelection.public,
                    label: i18next.t("public"),
                    description: ""
                }, {
                    id: privacySelection.private,
                    label: i18next.t("private"),
                    description: ""
                }
            ]
        }

        private showErrorMessage(errorCode: number)
        {
            let msg: string
            switch (errorCode)
            {
                case 422:
                    msg = i18next.t("github.errors.tokenExist")
                    break;
                case 10000:
                    msg = i18next.t("errors.blankUsernameOrPassword")
                    break;
                default:
                    msg = i18next.t("errors.unexpectedErrorCode", { code: errorCode })
                    break;
            }
            vscode.window.showErrorMessage(msg)
        }
    }
}