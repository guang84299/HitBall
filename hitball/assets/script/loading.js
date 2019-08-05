/**
 * Created by guang on 19/4/9.
 */

var res = require("res");
var qianqista = require("qianqista");
var sdk = require("sdk");
var storage = require("storage");
var config = require("config");

cc.qianqista = qianqista;
cc.sdk = sdk;
cc.storage = storage;
cc.config = config;
cc.myscene = "load";
cc.res = res;
cc.GAME = {};
cc.GAME.control = [];

cc.Class({
    extends: cc.Component,

    properties: {
        progressBar: {
            default: null,
            type: cc.ProgressBar
        },

        progressTips: {
            default: null,
            type: cc.Label
        },

        progressCar: {
            default: null,
            type: cc.Node
        },

        loadNode: {
            default: null,
            type: cc.Node
        }
    },


    onLoad: function() {

        //cc.sys.os = "web";
        this.resource = null;
        res.initPools();

        this.purls = [

            //"conf/base",


            "prefab/ball",


            //"images/sheep/buoy",

            "prefab/ui/selplayer",
            "prefab/ui/getplayer",
            "prefab/ui/jiesuan",
            "prefab/ui/qiandao",
            "prefab/ui/rank",
            "prefab/ui/power",
            "prefab/ui/toast",

            "prefab/anim/player36_boom",
            "prefab/anim/combo",

            //"prefab/particle/suijinbi",
            //"scene/game1"
        ];

        for(var i=1;i<=37;i++)
        {
            this.purls.push("prefab/player/player"+i);
        }


        this.completedCount = 0;
        this.totalCount = this.purls.length;
        this.loadCount = 0;

        this.nowtime = new Date().getTime();

        var self = this;
        qianqista.init("wxd0a8e8cb0a26a473","94a0a8379c28022350e4027cd54a5096","奇怪的击球",function(){
            var score = storage.getTotalScore();
            sdk.uploadScore(score,self.initNet.bind(self));
        });
        sdk.getUserInfo();
        //sdk.videoLoad();
        sdk.closeRank();
        sdk.keepScreenOn();


        this.loadNode.runAction(cc.repeatForever(cc.rotateBy(1,180)));

        this.isFirst = false;
        if(storage.getFirst() == 0)
        {
            this.isFirst = true;
            storage.setFirst(1);
            storage.setMusic(1);
            storage.setSound(1);
            storage.setVibrate(1);
            storage.setCoin(0);
            storage.addHasPlayer(1);
        }


        for(var i=0;i<2;i++)
            this.loadres();
    },

    loadres: function()
    {
        var self = this;
        if(this.loadCount<this.totalCount)
        {
            var index = this.loadCount;
            var path = this.purls[index];
            if(path.indexOf("images/sheep/") != -1)
            {
                cc.loader.loadRes(this.purls[index],cc.SpriteAtlas, function(err, prefab)
                {
                    self.progressCallback(self.completedCount,self.totalCount,prefab,index);
                });
            }
            else
            {
                cc.loader.loadRes(this.purls[index], function(err, prefab)
                {
                    self.progressCallback(self.completedCount,self.totalCount,prefab,index);
                });
            }

            this.loadCount++;
        }
    },


    progressCallback: function (completedCount, totalCount, resource,index) {
        this.progress = completedCount / totalCount;
        this.resource = resource;
        this.completedCount++;
        //this.totalCount = totalCount;

        this.progressBar.progress = this.progress;
        this.progressTips.string = "加载中 " + Math.floor(this.completedCount/this.totalCount*100)+"%";

        if(this.completedCount>=this.totalCount)
        {
            this.completeCallback();
        }
        else{
            this.loadres();
        }

        this.setRes(resource,index);

        this.progressCar.x = this.progress*300-150;
        //cc.log(resource);
    },
    completeCallback: function (error, resource) {
        console.log("-----completeCallback---time:",new Date().getTime()-this.nowtime);
        this.progressTips.string = "加载完成";
        this.progressBar.progress = 1;
        //this.progressTips.string = "加载中";
        //this.progressBar.node.active = true;
        //cc.loader.loadResDir("audio", this.progressCallback.bind(this), this.completeCallback2.bind(this));

        this.startGame();
    },

    startGame: function()
    {
        if(!this.loadNode.active && this.progressBar.progress >= 1)
        {
            this.progressBar.node.active = false;
            cc.director.loadScene("main");
        }

    },

    setRes: function(resource,index)
    {
        var url = this.purls[index];
        var pifx = "";
        if(url.indexOf("audio/") != -1)
            pifx = "audio_";
        else if(url.indexOf("prefab/player/") != -1)
            pifx = "player_";
        else if(url.indexOf("prefab/ui/") != -1)
            pifx = "prefab_ui_";
        else if(url.indexOf("prefab/anim/") != -1)
            pifx = "prefab_anim_";
        else if(url.indexOf("prefab/") != -1)
            pifx = "prefab_";
        else if(url.indexOf("conf/") != -1)
        {
            pifx = "conf_"+resource.name;
            //console.error(url,cc.url.raw("resources/"+url));
            resource = JSON.parse(resource.text);
        }

        if(url.indexOf("conf/") != -1)
            res[pifx] = resource;
        else
            res[pifx+resource.name] = resource;

        if(url == "prefab/ball")
        {
            res.initBallPool();
        }
        //cc.log(res);
    },

    initNet: function()
    {
        var self = this;
        var httpDatas = false;
        var httpControl = false;
        qianqista.datas(function(res){
            console.log('my datas:', res);
            if(res.state == 200)
            {
                self.updateLocalData(res.data);
            }
            httpDatas = true;

            if(httpDatas && httpControl)
            {
                self.loadNode.active = false;
                self.startGame();
            }

        });

        //qianqista.pdatas(function(res){
        //    self.updateLocalData2(res);
        //    httpPdatas = true;
        //
        //    if(httpDatas && httpPdatas && httpControl)
        //    {
        //        self.loadNode.active = false;
        //        self.startGame();
        //    }
        //});
        //qianqista.rankScore(function(res){
        //    self.worldrank = res.data;
        //});

        qianqista.control(function(res){
            console.log('my control:', res);
            if(res.state == 200)
            {
                cc.GAME.control = res.data;
            }
            httpControl = true;

            if(httpDatas && httpControl)
            {
                self.loadNode.active = false;
                self.startGame();
            }
        });

        //if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS)
        //{
        //    BK.Script.log(1,1,'---------qianqista.init：');
        //    BK.onEnterForeground(function(){
        //        BK.Script.log(1,1,"---onEnterForeground----");
        //
        //        //storage.playMusic(self.res.audio_bgm);
        //    });
        //}

    },

    updateLocalData: function(data)
    {
        if(data)
        {
            var datas = JSON.parse(data);
            if(datas.hasOwnProperty("first"))
                storage.setFirst(1);
            if(datas.hasOwnProperty("coin"))
                storage.setCoin(Number(datas.coin));

            if(datas.hasOwnProperty("highScore"))
                storage.setHighScore(Number(datas.highScore));

            if(datas.hasOwnProperty("totalScore"))
                storage.setTotalScore(Number(datas.totalScore));

            if(datas.hasOwnProperty("player"))
                storage.setPlayer(Number(datas.player));

            if(datas.hasOwnProperty("hasPlayer"))
                storage.setHasPlayer(datas.hasPlayer);

            if(datas.hasOwnProperty("qiandao_num"))
                storage.setQianDaoNum(Number(datas.qiandao_num));

            if(datas.hasOwnProperty("choujiangtoal_num"))
                storage.setChoujiangToalNum(Number(datas.choujiangtoal_num));

            //if(datas.hasOwnProperty("login_time"))
            //    storage.setLoginTime(Number(datas.login_time));

            if(datas.hasOwnProperty("login_day"))
                storage.setLoginDay(Number(datas.login_day));
            if(datas.hasOwnProperty("game_num"))
                storage.setGameNum(Number(datas.game_num));
            if(datas.hasOwnProperty("lixian_time"))
                storage.setLixianTime(Number(datas.lixian_time));

            if(datas.hasOwnProperty("yindao"))
                storage.setYinDao(Number(datas.yindao));


            if(datas.hasOwnProperty("ginvitelist"))
                cc.ginvitelist = datas.ginvitelist;
            if(datas.hasOwnProperty("ginvite_lnum"))
                storage.setInviteLnum(Number(datas.ginvite_lnum));


            console.log("datas:",datas);

            var now = new Date().getTime();
            if(datas.hasOwnProperty("login_time"))
                cc.login_time = Number(datas.login_time);
            else
                cc.login_time = now;
            storage.setLoginTime(now);
            storage.uploadLoginTime();

            if(res.isRestTime(cc.login_time,now))
            {
                storage.setLoginDay(parseInt(datas.login_day)+1);
                storage.uploadLoginDay();
            }
        }
        else
        {
            var now = new Date().getTime();
            cc.login_time = now;
            storage.setLoginTime(now);
            storage.setLoginDay(1);
            this.uploadData();
        }
    },

    updateLocalData2: function(res)
    {
        var self = this;
        if(res.state == 1)
        {
            qianqista.paddUser(function(res){
                //qianqista.rankScore(function(res2){
                //    self.worldrank = res2.data;
                //});
            },storage.getToalCoin()/config.totalCoinRate);
        }
        else
        {
            var datas = res.data;
            if(datas)
            {

            }
        }
    },

    uploadData: function()
    {
        var datas = {};
        datas.first = storage.getFirst();
        datas.coin = storage.getCoin();
        datas.player = storage.getPlayer();

        datas.login_time = storage.getLoginTime();
        datas.login_day = storage.getLoginDay();
        datas.game_num = storage.getGameNum();
        datas.ginvite_lnum = storage.getInviteLnum();

        datas.lixian_time = storage.getLixianTime();

        console.log("uploadData:",datas);
        var data = JSON.stringify(datas);
        var self = this;
        qianqista.uploaddatas(data,function(res){
            console.log("--uploaddatas:",res);
            //if(res && res.state == 200)
            //    self.updateData();
        });

        //qianqista.uploadScore(storage.getMaxPoint());
    }
});
