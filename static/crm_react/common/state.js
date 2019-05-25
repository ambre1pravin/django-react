import Baobab from 'baobab';

//Local
/*export const BASE_FULL_URL = 'http://127.0.0.1:8001';
export const RELATIVE_URL = 'http://127.0.0.1:8001';
export const IMAGE_PATH = 'http://127.0.0.1:8001';
export const CONTACT_IMAGE_PATH = 'http://127.0.0.1:8001/';
export const DIRECTORY_PATH = '/static/front';*/


//crm
export const BASE_FULL_URL = 'http://app.saalz.com';
export const RELATIVE_URL = 'http://app.saalz.com';
export const FIELD_SOURCE = 'http://app.saalz.com';
export const IMAGE_PATH = 'http://app.saalz.com';
export const CONTACT_IMAGE_PATH = 'http://app.saalz.com/';
export const DIRECTORY_PATH = '/static/front';


export const ROLES = config.user_info.ROLES
export const LOGED_IN_USER = config.user_info.LOGED_IN_USER
export const PROFILE_IMAGE = config.user_info.profile_image
export const activation_key = config.user_info.activation_key
export const user_status = config.user_info.user_status
export const language = config.user_info.lan
console.log(config.user_info.lan)
//export store;
const state = new Baobab({});
//window['MY_APP'] = window['MY_APP']
window.state = state;

export default state;