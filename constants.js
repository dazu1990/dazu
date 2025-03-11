import * as THREE from 'three';
// export const physicsScaleRate = 1;
// export const physicsScaleRate = 9.8;
export const physicsScaleRate = 100;


export const logoHeight = 280;
export const maxSphereDiameter = 30;
export const wallThickness = 10;

export const THEME = {
    colors:{
        hex:{
            org: '#DB912A',
            borg: '#de721f',
            pur: '#7A2ADB',
            grn: '#2ADB5C',
            dgrn: '#368A4D',
            brwn: '#5C4D38',
            dpur: '#412A5C',
            black: '#000000',
            white: '#FFFFFF',
        },
        three:{
            black: new THREE.Color(0x000000),
            white: new THREE.Color(0xFFFFFF),
            org: new THREE.Color(0xDB912A),
            borg: new THREE.Color(0xde721f),
            pur: new THREE.Color(0x7A2ADB),
            grn: new THREE.Color(0x2ADB5C),
            dgrn: new THREE.Color(0x368A4D),
            brwn: new THREE.Color(0x5C4D38),
            dpur: new THREE.Color(0x412A5C),
        },
        rgbChannels: {
            black: {r:0, g:0, b:0},
            white: {r:255, g:255, b:255},
            org: {r:219, g:145, b:42},
            borg: {r:222, g:114, b:31},
            pur: {r:122, g:42, b:219},
            grn: {r:42, g:219, b:92},
            dgrn: {r:54, g:138, b:77},
            brwn: {r:92, g:77, b:56},
            dpur: {r:65, g:42, b:92},
        },
        rgb: {
            black: 'rgb(0, 0, 0)',
            white: 'rgb(255, 255, 255)',
            org: 'rgb(219, 145, 42)',
            borg: 'rgb(222, 114, 31)',
            pur: 'rgb(122, 42, 219)',
            grn: 'rgb(42, 219, 92)',
            dgrn: 'rgb(54, 138, 77)',
            brwn: 'rgb(92, 77, 56)',
            dpur: 'rgb(65, 42, 92)',
        },
        hsla: {
            black: 'hsla(0, 0, 0, 1)',
            white: 'hsla(0, 0, 100, 1)',
            org: 'hsla(34, 71, 51, 1)',
            borg: 'hsla(34, 71, 51, 1)',
            pur: 'hsla(267, 71, 51, 1)',
            grn: 'hsla(136, 71, 51, 1)',
            dgrn: 'hsla(136, 43, 37, 1)',
            brwn: 'hsla(34, 24, 29, 1)',
            dpur: 'hsla(267, 37, 26, 1)',
        }
    },
    
    
};
