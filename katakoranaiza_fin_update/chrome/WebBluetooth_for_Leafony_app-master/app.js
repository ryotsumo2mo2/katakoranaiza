/*
 * app.js: simple BLE connect application
 *
 * This application uses Web Bluetooth API.
 * Supporting OS and browsers are listed in the link below.
 * https://github.com/WebBluetoothCG/web-bluetooth/blob/master/implementation-status.md
 */

 //import { set } from "./furie";

 const ctx = document.getElementById('chart');

function expi(theta) {return [Math.cos(theta), Math.sin(theta)];}
function iadd([ax, ay], [bx, by]) {return [ax + bx, ay + by];}
function isub([ax, ay], [bx, by]) {return [ax - bx, ay - by];}
function imul([ax, ay], [bx, by]) {return [ax * bx - ay * by, ax * by + ay * bx];}
function isum(cs) {return cs.reduce((s, c) => iadd(s, c), [0, 0]);}

const textDeviceName = document.getElementById('textDeviceName');
const textUniqueName = document.getElementById('textUniqueName');
const textDateTime = document.getElementById('textDateTime');
const textTemp = document.getElementById('textTemp');
const textHumid = document.getElementById('textHumid');
const textIllum = document.getElementById('textIllum');
const textTilt = document.getElementById('textTilt');
const textBatt = document.getElementById('textBatt');
const textDice = document.getElementById('textDice');



const buttonConnect = document.getElementById('ble-connect-button');
const buttonDisconnect = document.getElementById('ble-disconnect-button');
const buttonLedPls = document.getElementById('button-led-pls');
const buttonLedMns = document.getElementById('button-led-mns');
const buttonDownload = document.getElementById("button-download");

const switchSleepMode = document.getElementById('sleepmode-switch');

let leafony;

// array of received data
let savedData = [];
// length of savedData
const CSV_BUFF_LEN = 1024;


window.onload = function () {

	clearTable();

};

let kasokudocount = [] ;
let called = false;

function gobyokan () {
	if (called || !(kasokudocount.length > 6200 ))return
	console.log(kasokudocount.length)
	called = true;
setTimeout(main(kasokudocount),10000)
}


buttonConnect.addEventListener( 'click', function () {

	leafony = new Leafony();
	leafony.onStateChange( function ( state ) {
//		console.log(called);
		gobyokan();
		updateTable( state );
	} );

	if ( switchSleepMode.checked ) {
		leafony.enableSleep();
	} else {
		leafony.disableSleep();
	}

	leafony.connect();

	buttonConnect.style.display = 'none';
	buttonDisconnect.style.display = '';


} );


buttonDisconnect.addEventListener( 'click', function () {

	leafony.disconnect();
	leafony = null;

	clearTable();
	buttonConnect.style.display = '';
	buttonDisconnect.style.display = 'none';

} );

//thetaは引数、以下追加

function expi(theta) {return [Math.cos(theta), Math.sin(theta)];}
function iadd([ax, ay], [bx, by]) {return [ax + bx, ay + by];}
function isub([ax, ay], [bx, by]) {return [ax - bx, ay - by];}
function imul([ax, ay], [bx, by]) {return [ax * bx - ay * by, ax * by + ay * bx];}
function isum(cs) {return cs.reduce((s, c) => iadd(s, c), [0, 0]);}

function dft(f) //周波数成分配列
{
    const N = f.length, T = -2 * Math.PI / N;
    return [...Array(N).keys()].map(k => isum(
        f.map((fn, n) => imul(fn, expi(T * n * k)))
    ));
}

function idft(F) //複素数の時系列
{
    const N = F.length, T = 2 * Math.PI / N;
    return [...Array(N).keys()].map(t => isum(
        F.map((Fn, n) => imul(Fn, expi(T * n * t)))
    )).map(([r, i]) => [r / N, i / N]);
}


function clearTable () {

	textDeviceName.innerHTML = '';
	textUniqueName.innerHTML = '';
	textDateTime.innerHTML = '';
	textTemp.innerHTML = '';
	textHumid.innerHTML = '';
	textIllum.innerHTML = '';
	textTilt.innerHTML = '';
	textBatt.innerHTML = '';
	textDice.innerHTML = '';

}



function updateTable ( state ) {
	let date = new Date();
	let year     = String( date.getFullYear() );
	let month    = ( '00' + ( date.getMonth() + 1 ) ).slice( -2 );
	let day      = ( '00' + date.getDate() ).slice( -2 );
	let hours    = ( '00' + date.getHours() ).slice( -2 );
	let minutes  = ( '00' + date.getMinutes() ).slice( -2 );
	let seconds  = ( '00' + date.getSeconds() ).slice( -2 );
	let datetime = year + '/' + month + '/' + day + ' ' +
				   hours + ':' + minutes + ':' + seconds;

	textDeviceName.innerText = state.devn;
	textUniqueName.innerText = state.unin;
	textDateTime.innerText = datetime;
	textTemp.innerText = state.temp;
	textHumid.innerText = state.humd;
	textIllum.innerText = state.illm;
	textTilt.innerText = state.tilt;
	textBatt.innerText = state.batt;
	textDice.innerText = state.dice;

	

	kasokudocount.push (state.temp,state.humd,state.illm,state.tilt,state.batt,state.dice) ;
	console.log(kasokudocount);



	// Create array of reveived data and sensors data
	let darray = new Array(
		datetime,
		state.devn,
		state.unin,
		state.temp,
		state.humd,
		state.illm,
		state.tilt,
		state.batt,
		state.dice);

	// stack reveived data up to CSV_BUFF_LEN
	if (savedData.length >= CSV_BUFF_LEN) {
		savedData.shift();
	}
	savedData.push( darray );
}

//プラスボタン、マイナスボタン、ダウンロードボタンを削除

function dft(f) //周波数成分配列
{
    const N = f.length, T = -2 * Math.PI / N;
    return [...Array(N).keys()].map(k => isum(
        f.map((fn, n) => imul(fn, expi(T * n * k)))
    ));
}

function idft(F) //複素数の時系列
{
    const N = F.length, T = 2 * Math.PI / N;
    return [...Array(N).keys()].map(t => isum(
        F.map((Fn, n) => imul(Fn, expi(T * n * t)))
    )).map(([r, i]) => [r / N, i / N]);
}


const main = (fr0) =>{
//	const NN = [0.83,0.85]
//    const fr0 = kasokudocount;
    const f0 = fr0.map(r => [r, 0]);

	var fz = [];
    var fx = [];
    var fy = [];
    for(i=0;i<f0.length;i++){
      if(i % 3 === 0){ fz.push(f0[i]); }
      else if(i % 3 === 1){ fx.push(f0[i]); }
      else if(i % 3 === 2){ fy.push(f0[i]); }
    }
	//const fz = f0.map();

    console.log("fz:", fz);
    console.log("fx:", fx);
    console.log("fy:", fy);

    const Fz = dft(fz); //離散フーリエ
    const Fx = dft(fx); //離散フーリエ
    const Fy = dft(fy); //離散フーリエ
    //const f1 = idft(F); //逆離散フーリエ
    //const fr1 = f1.map(([r]) => r);

    const gurahukaz = kansuu( Fz );
    gurahukaz.shift();
    const gurahukax = kansuu( Fx );
    gurahukax.shift();
	const gurahukay = kansuu( Fy );
    gurahukay.shift();

    console.log("Fz:", Fz);
    console.log("Fx:", Fx);
    console.log("Fy:", Fy);
    //console.log("f1:", f1);
    //console.log("fr1:", fr1.map(Math.round));
    //console.log("gurahu:", gurahuka);

    const myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
			datasets: [{
			  label: 'Z',
			  data: gurahukaz,
			  // マーカー 背景色
			  backgroundColor: 'rgba(0, 159, 255, 0.45)',
			  // マーカー 枠線の色
			  borderColor: 'rgba(0, 159, 255, 0.5)',
			  // マーカー 大きさ
			  pointRadius: 1,
			},
			  // Group 2
		   {
			  label: 'X',
			  data: gurahukax,
			  backgroundColor: 'rgba(255, 48, 32, 0.45)',
			  borderColor: 'rgba(255, 48, 32, 0.5)',
			  pointRadius: 1,
			  },
  
			// Group 2
			{
			  label: 'Y',
			  data: gurahukay,
			  backgroundColor: 'rgba(10, 130, 50, 0.45)',
			  borderColor: 'rgba(10, 130, 50, 0.5)',
			  pointRadius: 1,
			},],
        },
        // options: {}, ...
      });
      console.log(myChart);

}

const kansuu = ( F ) => 
    F.map((v,i) => {
    const zettaiti = Math.sqrt(v[0]**2+v[1]**2);
    const syuhasu = i /(0.002*4096); //横X
    const sinpuku = zettaiti / 2048; //縦Y
    return { x : syuhasu,y : sinpuku };
});

//main()
