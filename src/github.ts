import * as vscode from 'vscode';
let request = require("request");
let i18next = require('i18next');

export module github
{
    export class github
    {
        private filename: string
        private code: string
        private userName: string = null
        private userPass: string = null
        private description: string

        constructor(filename: string, code: string)
        {
            this.filename = filename
            this.code = code
        }

        public start(defaults: boolean = false): Promise<string>
        {
            if (!defaults)
            {
                return this.auth().then(() =>
                {
                    return this.uploadFile()
                });
            }
            else
            {
                return this.uploadFile()
            }
        }

        private auth(): Promise<any>
        {
            return new Promise((resolve) =>
            {
                vscode.window.showInputBox({
                    placeHolder: i18next.t("github.username"),
                    value: vscode.workspace.getConfiguration('shareCode.gist').get('username').toString()
                }).then((userName: string) =>
                {
                    this.userName = userName
                }).then(() =>
                {
                    vscode.window.showInputBox({
                        placeHolder: i18next.t("github.password"),
                        password: true
                    }).then((userPass: string) =>
                    {
                        this.userPass = userPass
                        resolve()
                    })
                })
            })
        }

        private generateOptions(): Object
        {
            let data = {
                "description": this.description,
                "public": true,
                "files": {}
            }
            data.files[this.filename] = { "content": this.code };

            let opts = {
                url: 'https://api.github.com/gists',
                body: data,
                json: true,
                headers: {
                    'User-Agent': 'request'
                }
            }

            if (this.userName != null && this.userPass != null)
            {
                opts['auth'] = {
                    user: this.userName,
                    pass: this.userPass
                }
            }
            return opts
        }

        private uploadFile(): Promise<string>
        {
            return new Promise<string>((resolve) =>
            {
                vscode.window.showInputBox({
                    placeHolder: i18next.t("github.description")
                }).then((desc: string) =>
                {
                    this.description = desc
                }).then(() =>
                {
                    request.post(this.generateOptions(), (err, httpResponse, body) =>
                    {
                        resolve(body.html_url)
                    });
                })
            })
        }
    }

}