import * as vscode from 'vscode';
import * as moment from 'moment';
import { pastebin } from './pastebin';
import { github } from './github';
import { gitlab } from './gitlab/service';
let i18next = require('i18next');
let opn = require('opn');
let fs = require('fs');
let path = require('path')
let _ = require('underscore')

export module ShareCode
{
    interface ServiceQuickPick extends vscode.QuickPickItem
    {
        service: ShareCodeClasses.Service,
        anonym: Boolean
    }

    export class ShareCode
    {
        public share()
        {
            let file = this.readCurrentFile()

            vscode.window.showQuickPick(this.getServiceQuickPickItems(true)).then(
                (selection: ServiceQuickPick) =>
                {
                    if (selection != undefined)
                        selection.service.upload(file, selection.anonym).then((url: string) =>
                        {
                            this.showUrlAndOpen(url)
                        })
                }
            )
        }
        public open()
        {
            vscode.window.showQuickPick(this.getServiceQuickPickItems()).then(
                (selection: ServiceQuickPick) =>
                {
                    if (selection != undefined)
                        selection.service.open().then((url: string) =>
                        {
                            //
                        })
                }
            )
        }

        private readCurrentFile(): ShareCodeClasses.file
        {
            let file = new ShareCodeClasses.file
            file.setFileName(vscode.window.activeTextEditor.document.uri.path)
            file.codeFormat = vscode.window.activeTextEditor.document.languageId

            let selection: vscode.Selection
            selection = vscode.window.activeTextEditor.selection

            if (selection.isEmpty)
            {
                file.code = vscode.window.activeTextEditor.document.getText();
            }
            else
            {
                let range = new vscode.Range(selection.start, selection.end)
                file.code = vscode.window.activeTextEditor.document.getText(range);
            }
            return file
        }
        private getServiceQuickPickItems(withAnonym: boolean = false): Array<ServiceQuickPick>
        {
            let services = [
                {
                    label: i18next.t("pastebin.service"),
                    description: "",
                    anonym: false,
                    service: new pastebin.pastebin
                }, {
                    label: i18next.t("github.service"),
                    description: "",
                    anonym: false,
                    service: new github.github
                }, {
                    label: i18next.t("gitlab.service"),
                    description: "",
                    anonym: false,
                    service: new gitlab.gitlab
                }
            ]
            if (withAnonym)
            {
                let servicesAym = [
                    {
                        label: i18next.t("pastebin.serviceAnym"),
                        description: "",
                        anonym: true,
                        service: new pastebin.pastebin
                    }, {
                        label: i18next.t("github.serviceAnym"),
                        description: "",
                        anonym: true,
                        service: new github.github
                    }
                ]
                return _.union(services, servicesAym)
            }
            else
            {
                return services
            }
        }

        private showUrlAndOpen(url: string)
        {
            vscode.window.showInformationMessage(i18next.t("publishedMessage") + url)
            if (vscode.workspace.getConfiguration("shareCode").get("openSharedCodeInBrowser"))
                opn(url)
        }
    }
}
export module ShareCodeClasses
{
    export interface Service
    {
        upload(file: file, anonym: Boolean): Promise<string>,
        open(): Promise<any>
    }

    export class Configuration
    {
        private wspConf: vscode.WorkspaceConfiguration
        private scope
        private cache: Object = {}

        constructor(scope: string)
        {
            this.scope = scope
            this.wspConf = vscode.workspace.getConfiguration("shareCode." + scope)
        }
        get(key: "username" | "authtoken" | "baseurl"): string | null
        {
            if (!this.cache.hasOwnProperty(key))
            {
                this.cache[key] = this.wspConf.get(key, null)
            }
            console.log("read ", key, ":", this.cache[key])
            return this.cache[key]
        }
        set(key: "username" | "authtoken" | "baseurl", value: string): Thenable<void>
        {
            this.cache[key] = value
            return this.wspConf.update(key, value, true)
        }
    }

    export class tmpFile
    {
        private tmpPath
        private ns

        constructor(ns: string)
        {
            this.tmpPath = path.join(vscode.extensions.getExtension("RolandGreim.sharecode").extensionPath, 'tmp')
            this.ns = ns
        }

        public saveFile(id: string, filename: string, content: string)
        {
            this.mkDirIfNotExist(path.join(this.tmpPath))
            this.mkDirIfNotExist(path.join(this.tmpPath, this.ns))
            this.mkDirIfNotExist(path.join(this.tmpPath, this.ns, id))
            fs.writeFileSync(path.join(this.tmpPath, this.ns, id, filename), content);
        }

        public getFilePath(id: string, filename: string): string
        {
            return path.join(this.tmpPath, this.ns, id, filename)
        }

        private mkDirIfNotExist(path: string)
        {
            try
            {
                fs.accessSync(path)
            } catch (error)
            {
                fs.mkdirSync(path)
            }
        }
    }
    export class file
    {
        public fileName: string
        public code: string
        public codeFormat: string

        public setFileName(fileName: string)
        {
            this.fileName = fileName.split('\\').pop().split('/').pop();
        }
    }
    export class dateTime
    {
        public getDate(datetime: string): string
        {
            return moment(datetime).locale(vscode.env.language).format('ll')
        }
        public getDateUnix(datetime: string): string
        {
            return moment(datetime, 'X').locale(vscode.env.language).format('ll')
        }
    }
}
