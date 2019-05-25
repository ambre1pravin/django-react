import {language} from 'crm_react/common/state';
import {English, French } from 'crm_react/common/locale';
export function translate( key) {
    if(language === 'English'){
        return English[key]
    }else if(language === 'French'){
        return French[key]
    }else{
        return English[key]
    }
}