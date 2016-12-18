import * as vscode from 'vscode';
import {ShareCodeClasses} from '../sharecode';
let i18next = require('i18next');

export module zerobin
{
    export class zerobin implements ShareCodeClasses.Service
    {
        constructor()
        {

        }

        public upload(fileToUpload: ShareCodeClasses.file, defaults: boolean = false): Promise<string>
        {
            return new Promise((resolve) =>
            {

            })
        }

        public open(): Promise<string>
        {
            return new Promise((resolve) =>
            {

            })
        }
    }
}