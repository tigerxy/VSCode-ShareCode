import * as vscode from 'vscode';
import { ShareCodeClasses } from './sharecode';
let rp = require('request-promise');
let request = require("request"); //old
let i18next = require('i18next');
let parseString = require('xml2js').parseString;

export module pastebin
{
    enum privacySelection
    {
        public,
        unlisted,
        private
    }

    interface privacyQuickPick extends vscode.QuickPickItem
    {
        id: privacySelection
    }

    enum expireDateSelection
    {
        never,
        tenMinutes,
        oneHour,
        oneDay,
        oneWeek,
        twoWeeks,
        oneMonth
    }

    interface expireDateQuickPick extends vscode.QuickPickItem
    {
        id: expireDateSelection
        value: string
    }

    export class pastebin implements ShareCodeClasses.Service
    {
        private configuration: ShareCodeClasses.Configuration
        private dateTimeHandler: ShareCodeClasses.dateTime
        private fileHandler: ShareCodeClasses.tmpFile
        private devKey: string = "c3f4c23b158eb018d5c7930417964ea8"
        private option: string = "paste"
        private privacy: number = 1
        private expireDate: string = "N"
        private possibleFormats: Array<string> = ['4cs', '6502acme', '6502kickass', '6502tasm', 'abap', 'actionscript', 'actionscript3', 'ada', 'aimms', 'algol68', 'apache', 'applescript', 'apt_sources', 'arm', 'asm', 'asp', 'asymptote', 'autoconf', 'autohotkey', 'autoit', 'avisynth', 'awk', 'bascomavr', 'bash', 'basic4gl', 'dos', 'bibtex', 'blitzbasic', 'b3d', 'bmx', 'bnf', 'boo', 'bf', 'c', 'c_winapi', 'c_mac', 'cil', 'csharp', 'cpp', 'cpp-winapi', 'cpp-qt', 'c_loadrunner', 'caddcl', 'cadlisp', 'cfdg', 'chaiscript', 'chapel', 'clojure', 'klonec', 'klonecpp', 'cmake', 'cobol', 'coffeescript', 'cfm', 'css', 'cuesheet', 'd', 'dart', 'dcl', 'dcpu16', 'dcs', 'delphi', 'oxygene', 'diff', 'div', 'dot', 'e', 'ezt', 'ecmascript', 'eiffel', 'email', 'epc', 'erlang', 'fsharp', 'falcon', 'fo', 'f1', 'fortran', 'freebasic', 'freeswitch', 'gambas', 'gml', 'gdb', 'genero', 'genie', 'gettext', 'go', 'groovy', 'gwbasic', 'haskell', 'haxe', 'hicest', 'hq9plus', 'html4strict', 'html5', 'icon', 'idl', 'ini', 'inno', 'intercal', 'io', 'ispfpanel', 'j', 'java', 'java5', 'javascript', 'jcl', 'jquery', 'json', 'julia', 'kixtart', 'latex', 'ldif', 'lb', 'lsl2', 'lisp', 'llvm', 'locobasic', 'logtalk', 'lolcode', 'lotusformulas', 'lotusscript', 'lscript', 'lua', 'm68k', 'magiksf', 'make', 'mapbasic', 'matlab', 'mirc', 'mmix', 'modula2', 'modula3', '68000devpac', 'mpasm', 'mxml', 'mysql', 'nagios', 'netrexx', 'newlisp', 'nginx', 'nimrod', 'text', 'nsis', 'oberon2', 'objeck', 'objc', 'ocaml-brief', 'ocaml', 'octave', 'pf', 'glsl', 'oobas', 'oracle11', 'oracle8', 'oz', 'parasail', 'parigp', 'pascal', 'pawn', 'pcre', 'per', 'perl', 'perl6', 'php', 'php-brief', 'pic16', 'pike', 'pixelbender', 'plsql', 'postgresql', 'postscript', 'povray', 'powershell', 'powerbuilder', 'proftpd', 'progress', 'prolog', 'properties', 'providex', 'puppet', 'purebasic', 'pycon', 'python', 'pys60', 'q', 'qbasic', 'qml', 'rsplus', 'racket', 'rails', 'rbs', 'rebol', 'reg', 'rexx', 'robots', 'rpmspec', 'ruby', 'gnuplot', 'rust', 'sas', 'scala', 'scheme', 'scilab', 'scl', 'sdlbasic', 'smalltalk', 'smarty', 'spark', 'sparql', 'sqf', 'sql', 'standardml', 'stonescript', 'sclang', 'swift', 'systemverilog', 'tsql', 'tcl', 'teraterm', 'thinbasic', 'typoscript', 'unicon', 'uscript', 'ups', 'urbi', 'vala', 'vbnet', 'vbscript', 'vedit', 'verilog', 'vhdl', 'vim', 'visualprolog', 'vb', 'visualfoxpro', 'whitespace', 'whois', 'winbatch', 'xbasic', 'xml', 'xorg_conf', 'xpp', 'yaml', 'z80', 'zxbasic']

        constructor()
        {
            this.configuration = new ShareCodeClasses.Configuration('pastebin')
            this.fileHandler = new ShareCodeClasses.tmpFile('pastebin')
            this.dateTimeHandler = new ShareCodeClasses.dateTime()
        }

        public upload(fileToUpload: ShareCodeClasses.file, defaults: boolean = false): Promise<string>
        {
            fileToUpload.codeFormat = this.setCodeFormat(fileToUpload.codeFormat)
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
            return new Promise(resolve =>
            {
                this.auth()
                    .then(() =>
                    {
                        return rp.post({
                            url: 'https://pastebin.com/api/api_post.php',
                            formData: this.generateListFormData()
                        })
                    })
                    .then(xml =>
                    {
                        try
                        {
                            parseString('<root>\n' + xml + '</root>\n', (err, result) =>
                            {
                                let pastes = result.root.paste.map(paste =>
                                {
                                    let desc = paste.paste_title[0]
                                    if (desc == "")
                                    {
                                        desc = i18next.t("errors.noDescription")
                                    }
                                    return {
                                        label: desc,
                                        description: this.dateTimeHandler.getDateUnix(paste.paste_date[0]),
                                        pasteKey: paste.paste_key[0]
                                    }
                                })
                                vscode.window.showQuickPick(pastes).then((selected: any) =>
                                {
                                    if (selected != undefined)
                                    {
                                        request.post({
                                            url: 'https://pastebin.com/api/api_raw.php',
                                            formData: this.generateGetFormData(selected.pasteKey)
                                        }, (err, httpResponse, raw) =>
                                            {
                                                this.fileHandler.saveFile(selected.pasteKey, selected.label, raw)
                                                vscode.workspace.openTextDocument(this.fileHandler.getFilePath(selected.pasteKey, selected.label))
                                                    .then((doc: vscode.TextDocument) =>
                                                    {
                                                        vscode.window.showTextDocument(doc)
                                                        resolve()
                                                    });
                                            })
                                    }
                                })
                            });
                        } catch (error)
                        {
                            //TODO: Errorhandling
                        }
                    })
                    .catch(err =>
                    {
                        console.log(err)
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
                    id: privacySelection.unlisted,
                    label: i18next.t("unlisted"),
                    description: ""
                }, {
                    id: privacySelection.private,
                    label: i18next.t("private"),
                    description: ""
                }
            ]
        }

        private getExpireDateQuickPickItems(): Array<expireDateQuickPick>
        {
            return [
                {
                    id: expireDateSelection.never,
                    label: i18next.t("never"),
                    value: "N",
                    description: ""
                }, {
                    id: expireDateSelection.tenMinutes,
                    label: i18next.t("minute", { count: 10 }),
                    value: "10M",
                    description: ""
                }, {
                    id: expireDateSelection.oneHour,
                    label: i18next.t("hour", { count: 1 }),
                    value: "1H",
                    description: ""
                }, {
                    id: expireDateSelection.oneDay,
                    label: i18next.t("day", { count: 1 }),
                    value: "1D",
                    description: ""
                }, {
                    id: expireDateSelection.oneWeek,
                    label: i18next.t("week", { count: 1 }),
                    value: "1W",
                    description: ""
                }, {
                    id: expireDateSelection.twoWeeks,
                    label: i18next.t("week", { count: 2 }),
                    value: "2W",
                    description: ""
                }, {
                    id: expireDateSelection.oneMonth,
                    label: i18next.t("month", { count: 1 }),
                    value: "1M",
                    description: ""
                }
            ]
        }

        private auth(): Promise<void>
        {
            let userNameG, userPass;
            if (this.configuration.get("authtoken") == null)
            {
                return Promise.resolve(
                    vscode.window.showInputBox({
                        placeHolder: i18next.t("pastebin.username"),
                        value: this.configuration.get("username")
                    })
                        .then((userName: string) =>
                        {
                            userNameG = userName
                            return this.configuration.set('username', userName)
                        })
                        .then(() =>
                        {
                            return vscode.window.showInputBox({
                                placeHolder: i18next.t("pastebin.password"),
                                password: true
                            })
                        })
                        .then((userPass: string) =>
                        {
                            return rp.post({
                                url: 'https://pastebin.com/api/api_login.php',
                                formData: {
                                    api_dev_key: this.devKey,
                                    api_user_name: userNameG,
                                    api_user_password: userPass
                                }
                            })
                            // , (err, httpResponse, body: string) =>
                            //     {
                            //         if (body.startsWith("Bad API request"))
                            //         {
                            //             return Promise.reject(body.split('Bad API request, ').pop())
                            //         } else
                            //         {
                            //             return this.configuration.set('authtoken', body)
                            //         }
                            //     });
                        })
                        .then(body =>
                        {
                            if (body.startsWith("Bad API request"))
                            {
                                return Promise.reject(body.split('Bad API request, ').pop())
                            } else
                            {
                                return this.configuration.set('authtoken', body)
                            }
                        })
                        .then(text =>
                        {
                            console.log(this.configuration.get('authtoken'))
                            return null
                        })
                        // .catch(err =>
                        // {
                        //     vscode.window.showErrorMessage(err)
                        // })
                )
            }
            else
            {
                return Promise.resolve()
            }
        }

        private setCodeFormat(codeFormat: string): string
        {
            if (this.possibleFormats.lastIndexOf(codeFormat) >= 0)
            {
                return codeFormat
            }
            return null
        }

        private generateUploadFormData(fileToUpload: ShareCodeClasses.file): Object
        {
            var data = {
                api_dev_key: this.devKey,
                api_option: 'paste',
                api_paste_private: this.privacy,
                api_paste_expire_date: this.expireDate,
                api_paste_name: fileToUpload.fileName,
                api_paste_code: fileToUpload.code
            }
            if (fileToUpload.codeFormat != null)
            {
                data['api_paste_format'] = fileToUpload.codeFormat
            }
            if (this.configuration.get('authtoken') != null)
                data['api_user_key'] = this.configuration.get('authtoken')
            return data
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
                        this.privacy = privacy.id
                    }).then(
                    () =>
                    {
                        vscode.window.showQuickPick(this.getExpireDateQuickPickItems(), {
                            placeHolder: i18next.t('pastebin.chooseExpireDate')
                        }).then(
                            (expire: expireDateQuickPick) =>
                            {
                                this.expireDate = expire.value
                            }).then(
                            () =>
                            {
                                request.post({
                                    url: 'https://pastebin.com/api/api_post.php',
                                    formData: this.generateUploadFormData(fileToUpload)
                                }, (err, httpResponse, body) =>
                                    {
                                        console.log(body)
                                        resolve(body);
                                    })
                            })
                    })
            })
        }

        private generateListFormData(): Object
        {
            var data = {
                api_dev_key: this.devKey,
                api_user_key: this.configuration.get('authtoken'),
                api_option: 'list',
                api_results_limit: 50
            }
            return data
        }

        private generateGetFormData(pasteKey: string): Object
        {
            var data = {
                api_dev_key: this.devKey,
                api_user_key: this.configuration.get('authtoken'),
                api_option: 'show_paste',
                api_paste_key: pasteKey
            }
            return data
        }
    }
}