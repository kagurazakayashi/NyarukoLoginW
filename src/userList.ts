import mdui from 'mdui';
import API from './API';
import UserFileList from './fileList';
import Login from './login';
import NyaDom from './nyalib/nyadom';
import NyaNetwork from './nyalib/nyanetwork';
import { NyaTemplateElement } from './nyalib/nyatemplate';

export default class UserList {
    templateElement: NyaTemplateElement | null = null;
    api: API = new API();
    confirmDeleteObj: any = null;
    confirmQRCodeGObj: any = null;

    constructor() {
        window.g_Title.innerHTML = '用户列表';
        // sessionStorage.removeItem('info');
        this.api.getTempHTML(this.templateElement, 'userlist.template', (templateElement) => {
            this.templateElement = templateElement;
            const token = sessionStorage.getItem('Token');
            if (token == '' || token == null || token == 'undefined') {
                const login = new Login();
            } else {
                this.getUserList(token);
            }
            return true;
        });
        mdui.mutation();
    }

    getUserList(t: string) {
        const str = {
            date: 'YYYY-MM-dd HH:mm:ss',
            username: 'nickname',
            nickname: 'username',
            describe: 'describe',
            creation_date: 'creation_date',
            modification_date: 'modification_date',
            click: 'click',
        };
        NyaNetwork.post(
            window.g_url + 'userList/',
            { t: t },
            (data: XMLHttpRequest | null, status: number) => {
                if (data != null) {
                    const redata = JSON.parse(data.response);
                    if (data.status == 200) {
                        // console.log(redata);
                        let tabStr: string = '';
                        const infos: any[] = [];
                        redata['data'].forEach((ele: any) => {
                            const creationDate = ele[str.creation_date] > 0 ? this.api.formatTimeStamp(ele[str.creation_date] * 1000, str.date) : '';
                            const modificationDate = ele[str.modification_date] > 0 ? this.api.formatTimeStamp(ele[str.modification_date] * 1000, str.date) : '';
                            tabStr += this.templateElement?.codeByID('row', [
                                [str.username, ele[str.username]],
                                [str.nickname, ele[str.nickname]],
                                [str.describe, window.g_PermissionsList[String(ele['permissions_id'])][str.describe]],
                                [str.creation_date, creationDate],
                                [str.modification_date, modificationDate],
                            ]);
                            infos.push(ele);
                        });
                        NyaDom.byId('userListBody').innerHTML = tabStr;
                        const btninfos: HTMLButtonElement[] = NyaDom.byClass('ulbtninfo') as HTMLButtonElement[];
                        const btnqrs: HTMLButtonElement[] = NyaDom.byClass('ulbtnqr') as HTMLButtonElement[];
                        const btnEdits: HTMLButtonElement[] = NyaDom.byClass('ulbtnedit') as HTMLButtonElement[];
                        const btndeletes: HTMLButtonElement[] = NyaDom.byClass('ulbtndelete') as HTMLButtonElement[];
                        for (let i = 0; i < infos.length; i++) {
                            const elInfo: string = infos[i];
                            const that = this;
                            const elbtninfo: HTMLButtonElement = btninfos[i];
                            elbtninfo.addEventListener(str.click, function () {
                                that.userInfo(elInfo);
                            });
                            const elbtnqr: HTMLButtonElement = btnqrs[i];
                            elbtnqr.addEventListener(str.click, function () {
                                that.qrcodeGenerator(elInfo);
                            });
                            const elbtnEdit: HTMLButtonElement = btnEdits[i];
                            elbtnEdit.addEventListener(str.click, function () {
                                that.userEdit(elInfo);
                            });
                            const elbtndeletes: HTMLButtonElement = btndeletes[i];
                            elbtndeletes.addEventListener(str.click, function () {
                                that.userDelete(elInfo);
                            });
                        }
                    } else {
                        this.api.errHandle(redata['code']);
                    }
                }
            },
            false
        );
    }

    userInfo(info: any) {
        console.log('userInfo', info);
        this.clearScreen();
        sessionStorage.setItem('info', JSON.stringify(info));
        window.location.href = '#/userInfo';
    }

    qrcodeGenerator(info: any) {
        const qrcondDialog: HTMLDivElement = NyaDom.byId('qrGeneratorDialog') as HTMLDivElement;
        const dialogContent: HTMLInputElement[] = NyaDom.dom('.verifypassword', qrcondDialog) as HTMLInputElement[];
        const obj = {
            hash: info['username'],
        };
        const elistener = {
            hash: '',
            fuc() {
                NyaNetwork.post(
                    window.g_url + 'login/',
                    {
                        username: info['username'],
                        password: dialogContent[0].value,
                        verify: 1,
                    },
                    (data: XMLHttpRequest | null, status: number) => {
                        if (data != null) {
                            // const redata = JSON.parse(data.response);
                            if (data.status === 200) {
                                //TODO:生成二维码
                            } else {
                                alert('密码错误');
                            }
                        }
                    }
                );
                console.log('!!!', this.hash);
            },
        };
        qrcondDialog.removeEventListener('confirm', this.confirmQRCodeGObj);
        this.confirmQRCodeGObj = elistener.fuc.bind(obj);
        qrcondDialog.addEventListener('confirm', this.confirmQRCodeGObj);
    }

    userEdit(info: any) {
        console.log('userEdit', info['hash']);
        sessionStorage.setItem('info', JSON.stringify(info));
        window.location.href = '#/userEdit';
    }

    userDelete(info: any) {
        console.log('userDelete', info['hash']);
        const deleteDialog: HTMLDivElement = NyaDom.byId('deleteDialog') as HTMLDivElement;
        const dialogContent: HTMLDivElement[] = NyaDom.dom('.mdui-dialog-content', deleteDialog) as HTMLDivElement[];
        console.log('dialogContent', dialogContent);

        dialogContent.forEach((element) => {
            element.innerHTML = '是否删除用户：' + info['username'] + ' ?';
        });

        const obj = {
            hash: info['hash'],
        };
        const elistener = {
            hash: '',
            fuc() {
                // NyaNetwork.post(window.g_url + 'userList/', { t: this.hash }, (data: XMLHttpRequest | null, status: number) => {
                //     if (data != null) {
                //         const redata = JSON.parse(data.response);
                //         alert(redata);
                //     }
                // });
                console.log('!!!', this.hash);
            },
        };
        deleteDialog.removeEventListener('confirm', this.confirmDeleteObj);
        this.confirmDeleteObj = elistener.fuc.bind(obj);
        deleteDialog.addEventListener('confirm', this.confirmDeleteObj);
    }

    clearScreen() {
        const tooltips: HTMLDivElement[] = NyaDom.byClass('mdui-tooltip') as HTMLDivElement[];
        tooltips.forEach((tt) => {
            tt.remove();
        });
    }
}