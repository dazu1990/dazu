import * as THREE from 'three';

export const THEME = {
    colors:{
        hex:{
            org: '#DB912A',
            pur: '#7A2ADB',
            grn: '#2ADB5C',
            dgrn: '#368A4D',
            brwn: '#5C4D38',
            dpur: '#412A5C',
        },
        three:{
            org: new THREE.Color(0xDB912A),
            pur: new THREE.Color(0x7A2ADB),
            grn: new THREE.Color(0x2ADB5C),
            dgrn: new THREE.Color(0x368A4D),
            brwn: new THREE.Color(0x5C4D38),
            dpur: new THREE.Color(0x412A5C),
        },
        rgbChannels: {
            org: {r:219, g:145, b:42},
            pur: {r:122, g:42, b:219},
            grn: {r:42, g:219, b:92},
            dgrn: {r:54, g:138, b:77},
            brwn: {r:92, g:77, b:56},
            dpur: {r:65, g:42, b:92},
        },
        rgb: {
            org: 'rgb(219, 145, 42)',
            pur: 'rgb(122, 42, 219)',
            grn: 'rgb(42, 219, 92)',
            dgrn: 'rgb(54, 138, 77)',
            brwn: 'rgb(92, 77, 56)',
            dpur: 'rgb(65, 42, 92)',
        },
        hsla: {
            org: 'hsla(34, 71, 51, 1)',
            pur: 'hsla(267, 71, 51, 1)',
            grn: 'hsla(136, 71, 51, 1)',
            dgrn: 'hsla(136, 43, 37, 1)',
            brwn: 'hsla(34, 24, 29, 1)',
            dpur: 'hsla(267, 37, 26, 1)',
        }
    }
    
};
