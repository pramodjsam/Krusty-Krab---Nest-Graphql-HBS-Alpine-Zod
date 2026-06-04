import Noty, { Type } from 'noty';

export function notyNotification(message: string, type: Type = 'alert') {
  new Noty({
    text: message,
    type,
    timeout: 3000,
    layout: 'topRight',
    theme: 'mint',
  }).show();
}
