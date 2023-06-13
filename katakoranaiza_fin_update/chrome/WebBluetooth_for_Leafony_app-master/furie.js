const ctx = document.getElementById('chart');

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

const main = () =>{
    const NN = [0,1,-0.95,0,2,-0.79,0,3,-0.67,0,4,-0.88,0,5,-0.95,0,6,-0.79,0,7,-0.67,0,8,-0.88,0,9,-0.95,0,10,-0.79,0,11,-0.67,0,12,-0.88];
    const fr0 = NN;
    const f0 = fr0.map(r => [r, 0]);

    //const fz = f0.map();
    console.log("fr0:", fr0);

    var fz = [];
    var fx = [];
    var fy = [];
    for(i=0;i<f0.length;i++){
      if(i % 3 === 0){ fz.push(f0[i]); } // 偶奇判定、iを2で割った余りが0(false)なら偶数、1(true)なら奇数
      else if(i % 3 === 1){ fx.push(f0[i]); }
      else if(i % 3 === 2){ fy.push(f0[i]); }
    }

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
            pointRadius: 5,
          },
            // Group 2
         {
            label: 'X',
            data: gurahukax,
            backgroundColor: 'rgba(255, 48, 32, 0.45)',
            borderColor: 'rgba(255, 48, 32, 0.5)',
            pointRadius: 5,
            },

          // Group 2
          {
            label: 'Y',
            data: gurahukay,
            backgroundColor: 'rgba(10, 130, 50, 0.45)',
            borderColor: 'rgba(10, 130, 50, 0.5)',
            pointRadius: 5,
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



main()