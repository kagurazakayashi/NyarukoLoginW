import UserFileList from './fileList';
import Login from './login';
import NyaDom from './nyalib/nyadom';
import NyaNetwork from './nyalib/nyanetwork';
import NyaTemplate, { NyaTemplateElement } from './nyalib/nyatemplate';
import UserList from './userList';

export default class API {
    jumpPage(run?: () => {}) {
        let url: string[] = window.location.href.split('/#/');
        if (url.length == 2) {
            const token = sessionStorage.getItem('Token');
            if (token == '' || token == null || token == 'undefined') {
                let login = new Login();
            } else {
                this.getGroupList();
                switch (url[1]) {
                    case 'userInfo':
                        const userFileList = new UserFileList();
                        break;
                    default:
                        const userList = new UserList();
                        break;
                }
            }
        } else {
            if (run != null) {
                run();
            }else{
                const userList = new UserList();
            }
        }
    }

    getTempHTML(templateHTML: NyaTemplateElement | null, url: string, callback: (isDone: any) => {}) {
        if (!templateHTML || templateHTML.status < 1) {
            NyaTemplate.loadTemplate('dist/' + url + '.html', NyaDom.byClassFirst('container'), (templateElement: NyaTemplateElement) => {
                if (templateElement.status < 1) {
                    return;
                }
                callback(templateElement);
            });
        } else {
            templateHTML.loadTo(NyaDom.byClassFirst('container'));
        }
    }

    getPermissionsList() {
        NyaNetwork.post(
            window.g_url + 'permissionsList/',
            undefined,
            (data: XMLHttpRequest | null, status: number) => {
                if (data != null) {
                    const redata = JSON.parse(data.response);
                    if (data.status == 200) {
                        window.g_PermissionsList = redata['data'];
                    }
                }
            },
            false
        );
    }

    getGroupList() {
        NyaNetwork.post(
            window.g_url + 'groupList/',
            { t: sessionStorage.getItem('Token') },
            (data: XMLHttpRequest | null, status: number) => {
                if (data != null) {
                    const redata = JSON.parse(data.response);
                    if (data.status == 200) {
                        window.g_GroupList = redata['data'];
                    }
                }
            },
            false
        );
    }

    errHandle(errCode: number) {
        switch (errCode) {
            case 3900:
                sessionStorage.removeItem('Token');
                let login = new Login();
                break;
            case 4004:
                this.logOut();
                break;
            default:
                break;
        }
    }

    logOut() {
        let token = sessionStorage.getItem('Token');
        if (token == '' || token == null || token == 'undefined') {
            return;
        }
        NyaNetwork.post(window.g_url + 'logout/', { t: token }, (data: XMLHttpRequest | null, status: number) => {
            if (data != null) {
                sessionStorage.removeItem('Token');
                let login: Login = new Login();
            }
        });
    }

    formatTimeStamp(timeStamp: any, format: string): string {
        if (!timeStamp) {
            return '';
        }
        if (!format) {
            format = 'YYYY-MM-dd';
        }
        let strDate: any;
        switch (typeof timeStamp) {
            case 'string':
                strDate = new Date(timeStamp.replace(/-/g, '/'));
                break;
            case 'number':
                strDate = new Date(timeStamp);
                break;
        }
        if (strDate instanceof Date) {
            const dict: any = {
                YYYY: strDate.getFullYear(),
                M: strDate.getMonth() + 1,
                d: strDate.getDate(),
                H: strDate.getHours(),
                m: strDate.getMinutes(),
                s: strDate.getSeconds(),
                MM: ('' + (strDate.getMonth() + 101)).substring(1),
                dd: ('' + (strDate.getDate() + 100)).substring(1),
                HH: ('' + (strDate.getHours() + 100)).substring(1),
                mm: ('' + (strDate.getMinutes() + 100)).substring(1),
                ss: ('' + (strDate.getSeconds() + 100)).substring(1),
            };
            return format.replace(/(YYYY|MM?|dd?|HH?|ss?|mm?)/g, function () {
                return dict[arguments[0]];
            });
        }
        return '';
    }
}
