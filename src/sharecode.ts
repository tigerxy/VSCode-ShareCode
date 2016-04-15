import * as vscode from 'vscode';
import {pastebin} from './pastebin';
import {github} from './github';
let i18next = require('i18next');
let opn = require('opn');

export module sharecode
{
    enum serviceSelection
    {
        pastebin,
        pastebinAym,
        githubGist,
        githubGistAym
    }

    interface ServiceQuickPick extends vscode.QuickPickItem
    {
        id: serviceSelection
    }
    export class sharecode
    {
        private code: string
        private codeFormat: string
        private fileName: string

        constructor()
        {
            this.fileName = vscode.window.activeTextEditor.document.uri.path;
            this.fileName = this.fileName.split('\\').pop().split('/').pop();
            this.codeFormat = vscode.window.activeTextEditor.document.languageId;
            this.code = vscode.window.activeTextEditor.document.getText();
        }

        public start()
        {
            vscode.window.showQuickPick(this.getServiceQuickPickItems()).then(
                (selection: ServiceQuickPick) =>
                {
                    if (selection != undefined)
                        switch (selection.id)
                        {
                            case serviceSelection.githubGist:
                                var gb = new github.github(this.fileName, this.code)
                                gb.start().then((url: string) =>
                                {
                                    this.showUrlAndOpen(url)
                                })
                                break;
                            case serviceSelection.githubGistAym:
                                var gb = new github.github(this.fileName, this.code)
                                gb.start(true).then((url: string) =>
                                {
                                    this.showUrlAndOpen(url)
                                })
                                break;
                            case serviceSelection.pastebin:
                                var pb = new pastebin.pastebin(this.fileName, this.code, this.codeFormat)
                                pb.start().then((url: any) =>
                                {
                                    this.showUrlAndOpen(url)
                                })
                                break;
                            case serviceSelection.pastebinAym:
                                var pb = new pastebin.pastebin(this.fileName, this.code, this.codeFormat)
                                pb.start(true).then((url: string) =>
                                {
                                    this.showUrlAndOpen(url)
                                })
                                break;
                        }
                }
            )
        }

        private getServiceQuickPickItems(): Array<ServiceQuickPick>
        {
            return [
                {
                    id: serviceSelection.pastebinAym,
                    label: i18next.t("pastebin.serviceAnym"),
                    description: ""
                }, {
                    id: serviceSelection.githubGistAym,
                    label: i18next.t("github.serviceAnym"),
                    description: ""
                }, {
                    id: serviceSelection.pastebin,
                    label: i18next.t("pastebin.service"),
                    description: ""
                }, {
                    id: serviceSelection.githubGist,
                    label: i18next.t("github.service"),
                    description: ""
                }
            ]
        }

        private showUrlAndOpen(url: string)
        {
            vscode.window.showInformationMessage(i18next.t("publishedMessage") + url);
            opn(url);
        }
    }

}
