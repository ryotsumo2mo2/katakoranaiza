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

var image = document.getElementById('image');
var AppN = 0;
var Hyoka = 'Make humanity helthier';
var Bun = 'Take measurements about your KATAKORI.';

console.log(AppN)
console.log(Hyoka)
//document.getElementById('imagechange').innerText = AppN;
document.getElementById('Hyokachange').innerText = Hyoka;
document.getElementById('Bunchange').innerHTML = Bun;
Hyokachange.style.color = '#000000';

//条件文の発信箇所１

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
	AppN = 10;
	console.log(AppN)
	//document.getElementById('imagechange').innerText = AppN;

	Hyoka = 'Connecting...';
	document.getElementById('Hyokachange').innerText = Hyoka;

	Bun = 'Attempt to set up a Bluetooth connection with Leafony...';
	document.getElementById('Bunchange').innerHTML = Bun;
	console.log(Hyoka)
	
	
	leafony.onStateChange( function ( state ) {
		//console.log(called);
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

	//textDeviceName.innerHTML = '';
	textUniqueName.innerHTML = '';
	textDateTime.innerHTML = '';
	/*
	textTemp.innerHTML = '';
	textHumid.innerHTML = '';
	textIllum.innerHTML = '';
	textTilt.innerHTML = '';
	textBatt.innerHTML = '';
	textDice.innerHTML = '';
	*/
}



function updateTable ( state ) {
	let date = new Date();
	let year     = String( date.getFullYear() );
	let month    = ( '00' + ( date.getMonth() + 1 ) ).slice( -2 );
	let day      = ( '00' + date.getDate() ).slice( -2 );
	let hours    = ( '00' + date.getHours() ).slice( -2 );
	let minutes  = ( '00' + date.getMinutes() ).slice( -2 );
	let seconds  = ( '00' + date.getSeconds() ).slice( -2 );
	let datetime = year + '/' + month + '/' + day ; //+ ' ' + hours + ':' + minutes + ':' + seconds;

	//textDeviceName.innerText = state.devn;
	textUniqueName.innerText = state.unin;
	textDateTime.innerText = datetime;
	//textTemp.innerText = state.temp;
	//textHumid.innerText = state.humd;
	//textIllum.innerText = state.illm;
	//textTilt.innerText = state.tilt;
	//textBatt.innerText = state.batt;
	//textDice.innerText = state.dice;

	

	kasokudocount.push (state.temp,state.humd,state.illm,state.tilt,state.batt,state.dice) ;
	console.log(kasokudocount);
	var percentage = kasokudocount.length*0.016118633 ;
	var roundedPercentage = Number(percentage.toFixed(0))+' %';
	if(percentage > '100'){
		roundedPercentage = ' ';
		document.getElementById('paa').innerText = roundedPercentage;
	}else if(percentage < '100'){
	console.log(roundedPercentage); // 現在のパーセンテージの表示
	document.getElementById('paa').innerText = roundedPercentage;
	Bun = 'Please wait a few moments for the results...';
	document.getElementById('Bunchange').innerHTML = Bun;
	Hyoka = 'Analyzing...';
	document.getElementById('Hyokachange').innerText = Hyoka;
	}



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

/*
buttonLedPls.addEventListener ( 'click', function () {

	console.log( 'LED Plus Button Clicked' );
	leafony.sendCommand( 'PLS' );

});


buttonLedMns.addEventListener( 'click', function () {

	console.log( 'LED Minus Button Clicked' );
	leafony.sendCommand( 'MNS' );

});


buttonDownload.addEventListener( 'click', function () {

	let bom_utf_8 = new Uint8Array( [ 0xEF, 0xBB, 0xBF ] );
	let csvText = "";

	csvText += "Datetime,Device Name,Unique Name,Temp,Humid,Light\n";
	// Write all received data in savedData
	for ( var i = 0; i < savedData.length; i++ ) {
		for ( var j = 0; j < savedData[i].length-3; j++ ) {
			csvText += savedData[i][j];
			if ( j == savedData[i].length - 4 ) csvText += "\n";
			else csvText += ",";
		}
		for ( var j = savedData[i].length-6; j < savedData[i].length; j++ ) {
			csvText += savedData[i][j];
			if ( j == savedData[i].length - 1 ) csvText += "\n";
			else csvText += ",";
		}
	}

	let blob = new Blob( [ bom_utf_8, csvText ], { "type": "text/csv" } );

	let url = window.URL.createObjectURL( blob );

	let downloader = document.getElementById( "downloader" );
	downloader.download = "data.csv";
	downloader.href = url;
	$( "#downloader" )[0].click();

	delete csvText;
	delete blob;
});
*/

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
//	const NN = [0,1,-0.95,0,2,-0.79,0,3,-0.67,0,4,-0.88,0,5,-0.95,0,6,-0.79,0,7,-0.67,0,8,-0.88,0,9,-0.95,0,10,-0.79,0,11,-0.67,0,12,-0.88]; //一行追加
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
	console.log("gurahukaz:", gurahukaz);
    console.log("gurahukax:", gurahukax);
    console.log("gurahukay:", gurahukay);

	leafony.disconnect();
	leafony = null;


//以下追加点------------------状態評価条件

// 配列Fzの例
  var maxSinpuku = 0; // sinpukuの最大値を格納する変数
  var countInRange = 0; // 指定の範囲に該当するデータの数をカウントする変数
  
  for (var i = 0; i < gurahukaz.length; i++) {
	var data = gurahukaz[i];
	if (data.x >= 30 && data.x <= 70) {
	  countInRange++;
	  if (data.y > maxSinpuku) {
		maxSinpuku = data.y;
	  }
	}
  }
  // sinpukuの最大値を出力
  console.log("sinpukuの最大値:", maxSinpuku);
  // sinpukuの値に基づいて画像を表示する処理を追加してください
  if ( maxSinpuku >= 0.07) {
	 image.src = 'image/verybad.png';
	 AppN = 5;
	 Hyoka = 'Very hard!';
	 document.getElementById('Hyokachange').innerText = Hyoka;
	 Hyokachange.style.color = '#E64242';
	 Bun = 'Your neck and back muscles are extremely hard.<br>Your symptoms could be worse than you expect.<br><br>advice<br><br>・Give massages and stretches<br>・Try using hot towels or taking bath to warm your neck and back pain<br>・Consider going to go a medical facility if you can’t cure<br>';
	 document.getElementById('Bunchange').innerHTML = Bun;
	} // verybad
  else if ( maxSinpuku >= 0.05 && maxSinpuku > 0.07) {
	image.src = 'image/bad.png';
	 AppN = 6;
	 Hyoka = 'Hard';
	 document.getElementById('Hyokachange').innerText = Hyoka;
	 Hyokachange.style.color = '#E5C842';
	 Bun = 'Include stretches and light exercise your neck and back muscles<br><br>advice<br><br>・Take moderate breaks through your using smartphones or PCs for a long time<br>・Stretch your neck and back muscles and consider working out a little<br>';
	 document.getElementById('Bunchange').innerHTML = Bun;
	} // bad
  else if ( maxSinpuku >= 0.03 && maxSinpuku > 0.05) {
	image.src = 'image/good.png';
	 AppN = 7;
	 Hyoka = 'Soft';
	 document.getElementById('Hyokachange').innerText = Hyoka;
	 Hyokachange.style.color = '#4AE642';
	 Bun = 'Pay your attention to your poseure and lifestyle in everyday life<br><br>advice<br><br>・Do daily stretch and light exercise to keep your condition<br>・Have a break to create relaxing time through your daily life to decrease stress<br>';
	 document.getElementById('Bunchange').innerHTML = Bun;
	} // good
  else if ( maxSinpuku < 0.03) {
	image.src = 'image/verygood.png';
	 AppN = 8;
	 Hyoka = 'Very soft!';
	 document.getElementById('Hyokachange').innerText = Hyoka;
	 Hyokachange.style.color = '#425FE6';
	 Bun = 'You don’t seem to have any symptoms of Katakori<br><br>advice<br><br>・Keep your condition to have stretch<br>・Have moderate breaks and adjust your posture while using smartphones or PCs<br>';
	 document.getElementById('Bunchange').innerHTML = Bun;
	} // verygood
  // 指定の範囲に該当するデータの数を出力
  console.log("指定の範囲に該当するデータの数:", countInRange);
  console.log(AppN)
  //document.getElementById('imagechange').innerText = AppN;

	//以上追加点------------------

	//グラフ非表示は以下をコメントアウト
	/*
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
      */
	  
}

const kansuu = ( F ) => 
    F.map((v,i) => {
    const zettaiti = Math.sqrt(v[0]**2+v[1]**2);
    const syuhasu = i /(0.002*4096); //横X
    const sinpuku = zettaiti / 2048; //縦Y
    return { x : syuhasu,y : sinpuku };
});

//main()
