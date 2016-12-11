import * as vscode from 'vscode';
import { ShareCodeClasses } from '../sharecode';
import * as api from './api';
let i18next = require('i18next');

export module gitlab
{
    enum privacySelection
    {
        public = 20,
        internal = 10,
        private = 0
    }

    interface privacyQuickPick extends vscode.QuickPickItem
    {
        id: privacySelection
    }
    interface projectQuickPick extends vscode.QuickPickItem
    {
        project: api.Project
    }
    interface snippetQuickPick extends vscode.QuickPickItem
    {
        snippet: api.Snippets
    }

    export class gitlab implements ShareCodeClasses.Service
    {
        private configuration: ShareCodeClasses.Configuration
        private dateTimeHandler: ShareCodeClasses.dateTime
        private fileHandler: ShareCodeClasses.tmpFile
        private authtoken: string

        constructor()
        {
            this.configuration = new ShareCodeClasses.Configuration('gitlab')
            this.fileHandler = new ShareCodeClasses.tmpFile('gitlab')
            this.dateTimeHandler = new ShareCodeClasses.dateTime()
        }

        upload(file: ShareCodeClasses.file, anonym: Boolean): Promise<string>
        {
            return new Promise((resolve, reject) =>
            {
                this.getAuthtoken().then(() => 
                {
                    this.selectProject()
                        .then((project: api.Project) =>
                        {
                            vscode.window.showQuickPick(this.getPrivacyQuickPickItems(), {
                                placeHolder: i18next.t('pastebin.choosePrivacy')
                            }).then(
                                (privacy: privacyQuickPick) =>
                                {
                                    if (privacy != undefined)
                                    {
                                        vscode.window.showInputBox({
                                            placeHolder: i18next.t("github.description")
                                        }).then((desc: string) =>
                                        {
                                            console.log(privacy.id)
                                            this.getSnippetsApi()
                                                .createSnippet(project.id, desc, file.fileName, file.code, privacy.id)
                                                .then(({ response, body}: { response: Object; body: api.Snippets; }) =>
                                                {
                                                    resolve(body.web_url)
                                                })
                                        })
                                    }
                                    else
                                        reject()
                                })
                        })
                        .catch((res) => reject(res))
                })
            })
        }
        public async open()
        {
            await this.getAuthtoken()
            this.selectProject().then((project: api.Project) =>
            {
                this.getSnippetsApi()
                    .listSnippets(project.id)
                    .then(({response, body}: { response: Object; body: Array<api.Snippets>; }) =>
                    {
                        let list: Array<snippetQuickPick> = []
                        body.forEach(element =>
                        {
                            list.push({
                                snippet: element,
                                label: element.title,
                                detail: element.file_name,
                                description: this.dateTimeHandler.getDate(element.updatedAt)
                            })
                        });
                        vscode.window.showQuickPick<snippetQuickPick>(list, { placeholder: i18next.t("gitlab.select.snippet") })
                            .then((selected: snippetQuickPick) => 
                            {
                                if (selected != undefined)
                                {
                                    this.getSnippetsApi()
                                        .getSnippetContent(project.id, selected.snippet.id)
                                        .then(({response, body}: { response: Object; body: string; }) =>
                                        {
                                            this.fileHandler.saveFile(selected.snippet.id.toString(), selected.snippet.file_name, body)
                                            vscode.workspace.openTextDocument(this.fileHandler.getFilePath(selected.snippet.id.toString(), selected.snippet.file_name))
                                                .then((doc: vscode.TextDocument) =>
                                                {
                                                    vscode.window.showTextDocument(doc)
                                                })
                                        })
                                }
                            })
                    })
            })
            .catch(res => 
            {
                vscode.window.showErrorMessage(i18next.t("errors.tokenWrongOrExpired"))
            })
        }
        private selectProject(): Promise<api.Project>
        {
            return new Promise((resolve, reject) =>
                this.getProjectApi()
                    .listProjects()
                    .then(({response, body}: { response: Object; body: Array<api.Project>; }) =>
                    {
                        let list: Array<projectQuickPick> = []
                        body.forEach(element =>
                        {
                            list.push({ project: element, label: element.name, detail: element.namespace.name })
                        });
                        vscode.window.showQuickPick<projectQuickPick>(list, { placeholder: i18next.t("gitlab.select.project") })
                            .then((item: projectQuickPick) => 
                            {
                                if (item != undefined)
                                {
                                    resolve(item.project)
                                } else
                                {
                                    reject()
                                }
                            })
                    })
                    .catch(res => reject(res))
            )
        }
        private async getAuthtoken()
        {
            let userNameG, userPass;
            if (this.configuration.get("authtoken") == null)
            {
                await new Promise<void>((resolve, reject) =>
                {
                    vscode.window.showInputBox({
                        ignoreFocusOut: true,
                        prompt: i18next.t("gitlab.baseUrl"),
                        value: "https://gitlab.com/"
                    }).then(baseUrl =>
                    {
                        if (baseUrl != undefined)
                        {
                            this.configuration.set("baseurl", baseUrl)
                            vscode.window.showInputBox({
                                ignoreFocusOut: true,
                                prompt: i18next.t("gitlab.token.generate", { url: baseUrl }),
                                placeHolder: i18next.t("gitlab.token.insert")
                            }).then(token =>
                            {
                                if (token != undefined)
                                {
                                    this.configuration.set("authtoken", token)
                                    resolve()
                                }
                                else
                                    reject()
                            })
                        }
                        else
                            reject()
                    })
                })
            }
            this.authtoken = this.configuration.get("authtoken")
        }
        private getProjectApi(): api.ProjectApi
        {
            let projects = new api.ProjectApi(this.configuration.get("baseurl"))
            projects.setApiKey(api.ProjectApiApiKeys.privateTokenHeader, this.authtoken)
            projects.setApiKey(api.ProjectApiApiKeys.privateTokenQuery, this.authtoken)
            return projects
        }
        private getSnippetsApi(): api.SnippetsApi
        {
            let projects = new api.SnippetsApi(this.configuration.get("baseurl"))
            projects.setApiKey(api.SnippetsApiApiKeys.privateTokenHeader, this.authtoken)
            projects.setApiKey(api.SnippetsApiApiKeys.privateTokenQuery, this.authtoken)
            return projects
        }

        private getPrivacyQuickPickItems(): Array<privacyQuickPick>
        {
            return [
                {
                    id: privacySelection.public,
                    label: i18next.t("public"),
                    description: i18next.t("gitlab.public")
                }, {
                    id: privacySelection.internal,
                    label: i18next.t("internal"),
                    description: i18next.t("gitlab.internal")
                }, {
                    id: privacySelection.private,
                    label: i18next.t("private"),
                    description: i18next.t("gitlab.private")
                }
            ]
        }
    }
}