/*
 * @Author: mikey.zhaopeng 
 * @Date: 2021-02-07 22:52:28 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-02-23 17:46:52
 */
// 对象收编变量
//全局变量 键值对
// var a = 1;
// var b = 10; 
// var obj = {
//     a : 1,
//     b : 10,
//     text : function () {},
// };

var bird = {
    skyPosition : 0,
    skyStep: 2,
    birdTop: 220,
    birdStepY: 0,
    startColor : 'blue',
    startFlag : false,
    minTop : 0,
    maxTop : 570,
    pipeLength : 7,
    pipeArr : [],
    pipeLastIndex : 6,
    score : 0,
    /*初始化函数*/
    init : function () {
        this.initData();
        this.animate();
        this.handle();
        if(sessionStorage.getItem('play')){
            this.start();
        }
    },
    initData : function () {
        this.el = document.getElementById('game');
        this.oBird = this.el.getElementsByClassName('bird')[0];
        this.oStart = this.el.getElementsByClassName('start')[0];
        this.oScore = this.el.getElementsByClassName('score')[0];
        this.oMask = this.el.getElementsByClassName('mask')[0];
        this.oEnd = this.el.getElementsByClassName('end')[0];
        this.oFinalScore = this.oEnd.getElementsByClassName('final-score')[0];
        this.oRankList = this.oEnd.getElementsByClassName('rank-list')[0];
        this.oRestart = this.el.getElementsByClassName('restart')[0];
        
        this.scoreArr = this.getScore();
        console.log(this.scoreArr);
    },
    getScore : function () {
        var scoreArr = getLocal('score');    //值不存在 === null 
        return scoreArr ? scoreArr : [];
    },
    // 动画
    animate : function () {
        var count = 0;
        var self = this;
        
        this.timer = setInterval(function (){
            self.skyMove();  /* 天空移动 */
            
            if(self.startFlag){
                self.pipeMove();/* 柱子移动 */
                self.birdDrop();/* 小鸟下落 */
            }

            if(++ count % 10 === 0){
                if(!self.startFlag){
                    self.birdJump(); /* 小鸟蹦跶 */
                    self.startBound(); /* 开始字运动 */
                }
                self.birdFly(count); /* 小鸟飞 */
            }
        }, 30)
       
    },
    /**
     * 天空移动
     */
    skyMove : function () {
        this.skyPosition -= this.skyStep;
        this.el.style.backgroundPositionX = this.skyPosition + 'px';
    },
    /**
     * 小鸟蹦跶
     */
    birdJump : function () {
        this.birdTop = this.birdTop === 220 ? 260 : 220;
        this.oBird.style.top = this.birdTop + 'px';
    },
    startBound : function () {
        var prevColor = this.startColor;
        this.startColor = prevColor === 'blue' ? 'white' : 'blue';
        this.oStart.classList.remove('start--' + prevColor);
        this.oStart.classList.add('start--' +  this.startColor);
    },
    /**
     * 小鸟飞
     */
    birdFly : function (count) {
        this.oBird.style.backgroundPositionX =  count % 3 * -30 + 'px';
    },
    /**
     * 小鸟未操做下落
     */
    birdDrop : function () {
        this.birdTop += ++ this.birdStepY;
        this.oBird.style.top = this.birdTop + 'px';
        this.judgeKnock();
        this.addScore();
    }, 
    /**
     * 柱子移动
     * */ 
    pipeMove : function () {
        for(var i = 0; i < this.pipeLength; i ++){
            var oUpPige = this.pipeArr[i].up;
            var oDownPige = this.pipeArr[i].down;
            var x = oUpPige.offsetLeft - this.skyStep;
            if(x < - 52){
                var lastpipeLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft;
                oUpPige.style.left = lastpipeLeft + 300 + 'px';
                oDownPige.style.left = lastpipeLeft + 300 + 'px';
                this.pipeLastIndex = ++ this.pipeLastIndex % this.pipeLength;

                var height = this.getPipeHeight().up;
                var downHight = this.getPipeHeight().down;

                oUpPige.style.height = height;
                oDownPige.style.height = downHight;

                continue;
            } 
            oUpPige.style.left = x + 'px';
            oDownPige.style.left = x + 'px';
        } 
    }, 
    getPipeHeight : function () {
        var upHight = 50 + Math.floor(Math.random() * 175);  
        var downHight = 600 - 150 - upHight;

        return {
            up : upHight,
            down : downHight,
        }
    }, 
    /* 
        碰撞判断
    */
    judgeKnock : function () {
        this.judgeBoundary();
        this.judgePipe();
    },
    /* 
    *越界监测
    */
    judgeBoundary : function () {
        if(this.birdTop < this.minTop || this.birdTop > this.maxTop){
            this.failGame();
        }
    },
    /**
    *柱子碰撞监测
    */
    judgePipe : function () {
        var index = this.score % this.pipeLength;
        var pipeY = this.pipeArr[index].y;
        var pipeX = this.pipeArr[index].up.offsetLeft;
        var birdY = this.birdTop;


        if((pipeX <= 95 && pipeX >= 13) && (birdY <= pipeY[0] || birdY >= pipeY[1])){
            this.failGame();
        } 
    }, 
    addScore : function(){
        var index = this.score % this.pipeLength;
        var pipeX = this.pipeArr[index].up.offsetLeft;
        if(pipeX < 13){
            this.oScore.innerText = ++ this.score;
        }
    },
    /**
     * 鼠标控制
     */
    handle : function () {
        this.handleStart();
        this.handleClick();
        this.handleRestart();
    },
    /**
     * 点击开始
     */
    handleStart : function () {
        var self = this;
        
        this.oStart.onclick = this.start.bind(this);
    },
    start : function () {
            var self = this;
            self.startFlag = 'true';
            self.oBird.style.transition = 'none';
            self.oBird.style.left = '80px';
            self.oStart.style.display = 'none';
            self.oScore.style.display = 'block';
            self.skyStep = 5;
            for(var i = 0; i < self.pipeLength; i ++){
                self.creatPipe(300 * (i + 1));
            } 
    },
    handleClick : function () {
        // this.birdStepY = -10;
        var self = this;
        this.el.onclick = function (e) {
            if (!e.target.classList.contains("start")){
                self.birdStepY = -10;
            }
        };
    }, 
    handleRestart : function () {
        this.oRestart.onclick = function () {

            sessionStorage.setItem('play' ,true);
            window.location.reload();
            
        };
    },

    creatPipe : function (x) {
        // var pipehight 
        
        var upHight = 50 + Math.floor(Math.random() * 175);  
        var downHight = 600 - 150 - upHight;
        
        // var oDiv = document.createElement('div');
        // oDiv.classList.add('pipe');
        // oDiv.classList.add('pipe-up');
        // oDiv.style.height = upHight + 'px';
        
        // this.el.appendChild(oDiv);

        var oUpPige = createEle("div" ,['pipe' , 'pipe-up'] ,{
            height : upHight + 'px' , 
            left : x + "px"
        })

        var oDownPige = createEle('div' ,['pipe' , 'pipe-botton'],{
            height : downHight + 'px' ,
            left : x + "px" 
        }); 
        this.el.appendChild(oUpPige);
        this.el.appendChild(oDownPige);
        this.pipeArr.push({
            up : oUpPige,
            down : oDownPige,
            y : [upHight , upHight + 150],
        })
    },
    setScore : function () {
        this.scoreArr.push({
            score : this.score,
            time : this.getDate(),
        })
        setLocal('score' ,this.scoreArr);
        this.scoreArr.sort(function (a , b){
            return b.score - a.score;
        })
    },
    getDate : function () {
        var d = new Date();
        var year = d.getFullYear();
        var mouth = formatNum (d.getMonth() + 1);
        var day = formatNum (d.getDate());
        var hour = formatNum (d.getHours());
        var minute = formatNum (d.getMinutes());
        var second = formatNum (d.getSeconds());

        return `${year}.${mouth}.${day} ${hour}.${minute}.${second}`;
    }, 
    failGame : function () {
        clearInterval(this.timer);
        this.oMask.style.display = 'block';
        this.oEnd.style.display = 'block';
        this.oBird.style.display = 'none';
        this.oScore.style.display = 'none';
        this.oFinalScore.innerText = this.score;
        this.setScore();
        this.renderRankList();
    },  
    renderRankList : function () {
        var template = '';
    
        for (var i = 0; i < 8; i ++) {
            var degreeClass = '';
            console.log(i)
            switch (i) {
                case 0:
                    degreeClass = 'first';
                    break;
                case 1:
                    degreeClass = 'second';
                    break;
                case 2:
                    degreeClass = 'third';
                    break; 
            }
            template += `
                <li class="rank-item">
                        <span class="rank-degree ${degreeClass}">${i + 1}</span>
                        <span class="rank-score">${this.scoreArr[i].score}</span>
                        <span class="rank-time">${this.scoreArr[i].time}</span>
                </li>
            `
        }
        console.log(template);
        this.oRankList.innerHTML = template;
    },
};

