'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
let request = require("request");
let opn = require("opn");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "Share Code" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.shareCode', () => {
        // The code you place here will be executed every time your command is executed
        // Convert fullpath to filename
        if (vscode.window.activeTextEditor != null) {
            let fileName: string = vscode.window.activeTextEditor.document.uri.path;
            fileName = fileName.split('\\').pop().split('/').pop();
            let codeFormat: string = vscode.window.activeTextEditor.document.languageId;
            let code: string = vscode.window.activeTextEditor.document.getText();

            vscode.window.showQuickPick(['Pastebin (anonymous)', 'GitHub Gist (anonymous)', 'Pastebin', 'GitHub Gist']).then((selection: string) => {
                if (selection == 'Pastebin (anonymous)') {
                    uploadToPastebin(fileName, codeFormat, code);
                } else if (selection == 'Pastebin') {
                    vscode.window.showInputBox({ 
                        placeHolder: "Pastebin Username" 
                    }).then((userName: string) => {
                        vscode.window.showInputBox({ 
                            placeHolder: "Pastebin Password", 
                            password: true 
                        }).then((userPass: string) => {
                            let data = {
                                api_dev_key: "c3f4c23b158eb018d5c7930417964ea8",
                                api_user_name: userName,
                                api_user_password: userPass
                            }

                            request.post({ 
                                url: 'https://pastebin.com/api/api_login.php', 
                                formData: data 
                            }, (err, httpResponse, body: string) => {
                                if (body.startsWith("Bad API request")) {
                                    vscode.window.showErrorMessage(body.split('Bad API request, ').pop())
                                } else {
                                    uploadToPastebin(fileName, codeFormat, code, body);
                                }
                            });
                        })
                    })
                } else if (selection == 'GitHub Gist (anonymous)') {
                    uploadToGist(fileName, code);
                } else if (selection == 'GitHub Gist') {
                    vscode.window.showInputBox({ 
                        placeHolder: "GitHub Username"
                    }).then((userName: string) => {
                        vscode.window.showInputBox({ 
                            placeHolder: "GitHub Password", 
                            password: true 
                        }).then((userPass: string) => {
                            uploadToGist(fileName, code, userName, userPass);
                        })
                    })
                }
            })

            function uploadToPastebin(filename: string, codeFormat: string, code: string, authToken: string = null): void {
                vscode.window.showQuickPick(['public','unlisted','private'], {placeHolder: 'Choose privacy'}).then((privacy:string) => {
                    let data = {
                        api_dev_key: "c3f4c23b158eb018d5c7930417964ea8",
                        api_option: 'paste',
                        api_paste_private: 1,
                        api_paste_name: fileName,
                        api_paste_code: code
                    }
                    
                    switch (privacy) {
                        case 'private':
                            data.api_paste_private = 2;
                            break;
                        case 'unlisted':
                            data.api_paste_private = 1;
                            break;
                        default:
                            data.api_paste_private = 0;
                            break;
                    }
                    
                    let possibleFormats = ['4cs', '6502acme', '6502kickass', '6502tasm', 'abap', 'actionscript', 'actionscript3', 'ada', 'aimms', 'algol68', 'apache', 'applescript', 'apt_sources', 'arm', 'asm', 'asp', 'asymptote', 'autoconf', 'autohotkey', 'autoit', 'avisynth', 'awk', 'bascomavr', 'bash', 'basic4gl', 'dos', 'bibtex', 'blitzbasic', 'b3d', 'bmx', 'bnf', 'boo', 'bf', 'c', 'c_winapi', 'c_mac', 'cil', 'csharp', 'cpp', 'cpp-winapi', 'cpp-qt', 'c_loadrunner', 'caddcl', 'cadlisp', 'cfdg', 'chaiscript', 'chapel', 'clojure', 'klonec', 'klonecpp', 'cmake', 'cobol', 'coffeescript', 'cfm', 'css', 'cuesheet', 'd', 'dart', 'dcl', 'dcpu16', 'dcs', 'delphi', 'oxygene', 'diff', 'div', 'dot', 'e', 'ezt', 'ecmascript', 'eiffel', 'email', 'epc', 'erlang', 'fsharp', 'falcon', 'fo', 'f1', 'fortran', 'freebasic', 'freeswitch', 'gambas', 'gml', 'gdb', 'genero', 'genie', 'gettext', 'go', 'groovy', 'gwbasic', 'haskell', 'haxe', 'hicest', 'hq9plus', 'html4strict', 'html5', 'icon', 'idl', 'ini', 'inno', 'intercal', 'io', 'ispfpanel', 'j', 'java', 'java5', 'javascript', 'jcl', 'jquery', 'json', 'julia', 'kixtart', 'latex', 'ldif', 'lb', 'lsl2', 'lisp', 'llvm', 'locobasic', 'logtalk', 'lolcode', 'lotusformulas', 'lotusscript', 'lscript', 'lua', 'm68k', 'magiksf', 'make', 'mapbasic', 'matlab', 'mirc', 'mmix', 'modula2', 'modula3', '68000devpac', 'mpasm', 'mxml', 'mysql', 'nagios', 'netrexx', 'newlisp', 'nginx', 'nimrod', 'text', 'nsis', 'oberon2', 'objeck', 'objc', 'ocaml-brief', 'ocaml', 'octave', 'pf', 'glsl', 'oobas', 'oracle11', 'oracle8', 'oz', 'parasail', 'parigp', 'pascal', 'pawn', 'pcre', 'per', 'perl', 'perl6', 'php', 'php-brief', 'pic16', 'pike', 'pixelbender', 'plsql', 'postgresql', 'postscript', 'povray', 'powershell', 'powerbuilder', 'proftpd', 'progress', 'prolog', 'properties', 'providex', 'puppet', 'purebasic', 'pycon', 'python', 'pys60', 'q', 'qbasic', 'qml', 'rsplus', 'racket', 'rails', 'rbs', 'rebol', 'reg', 'rexx', 'robots', 'rpmspec', 'ruby', 'gnuplot', 'rust', 'sas', 'scala', 'scheme', 'scilab', 'scl', 'sdlbasic', 'smalltalk', 'smarty', 'spark', 'sparql', 'sqf', 'sql', 'standardml', 'stonescript', 'sclang', 'swift', 'systemverilog', 'tsql', 'tcl', 'teraterm', 'thinbasic', 'typoscript', 'unicon', 'uscript', 'ups', 'urbi', 'vala', 'vbnet', 'vbscript', 'vedit', 'verilog', 'vhdl', 'vim', 'visualprolog', 'vb', 'visualfoxpro', 'whitespace', 'whois', 'winbatch', 'xbasic', 'xml', 'xorg_conf', 'xpp', 'yaml', 'z80', 'zxbasic'];
                    
                    if(possibleFormats.lastIndexOf(codeFormat) >= 0) {
                        data['api_paste_format'] = codeFormat
                    }
                    
                    if (authToken != null)
                        data['api_user_key'] = authToken

                    request.post({ 
                        url: 'https://pastebin.com/api/api_post.php', 
                        formData: data 
                    }, (err, httpResponse, body) => {
                        vscode.window.showInformationMessage("Your File is published here: " + body);
                        opn(body);
                    });
                })
            }

            function uploadToGist(filename: string, code: string, userName: string = null, userPass: string = null) {
                vscode.window.showInputBox({ 
                    placeHolder: 'Description of your file' 
                }).then((desc: string) => {
                    let data = {
                        "description": desc,
                        "public": true,
                        "files": {}
                    }
                    data.files[filename] = {"content": code};
                    
                    let opts = {
                        url: 'https://api.github.com/gists',
                        body: data,
                        json: true,
                        headers: {
                            'User-Agent': 'request'
                        }
                    }
                    
                    if (userName != null && userPass != null) {
                        opts['auth'] = {
                            user: userName,
                            pass: userPass
                        }
                    }
                    
                    request.post(opts, (err, httpResponse, body) => {
                        vscode.window.showInformationMessage("Your File is published here: " + body.html_url);
                        opn(body.html_url)
                    });
                })
            }
        } else {
            vscode.window.showErrorMessage('No file for sharing found. Please open one in edit mode.')
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}