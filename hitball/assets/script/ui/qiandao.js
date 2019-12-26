var storage = require("storage");
var res = require("res");

cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    onLoad: function()
    {

        
    },
    initUI: function()
    {
        this.bg = cc.find("bg",this.node);

        this.items = cc.find("items",this.bg).children;
        this.btn_lingqu = cc.find("btns/lingqu",this.bg).getComponent(cc.Button);
        this.btn_lingqu2 = cc.find("btns/lingqu2",this.bg).getComponent(cc.Button);

        this.btn_lingqu.mcolor = this.btn_lingqu.node.color;
        this.btn_lingqu2.mcolor = this.btn_lingqu2.node.color;
    },

    updateUI: function()
    {
        var loginDay = storage.getLoginDay();
        var qiandaoNum = storage.getQianDaoNum();
        this.qiandaoNum = qiandaoNum;
        var canSign = false;
        if(loginDay>qiandaoNum && qiandaoNum<7)
        {
            canSign = true;
        }

        for(var i=0;i<this.items.length;i++)
        {
            var item = this.items[i];
            var award = cc.find("award",item).getComponent(cc.Label);
            var desc = cc.find("desc",item);
            var box = cc.find("box",item);
            var mask = cc.find("mask",item);

            // var data = res.conf_qiandao[i];

            // award.string = storage.castNum(Number(data.reward));
            var dayNum = i;
            if(i == this.items.length-1) dayNum = 5;
            if(dayNum==qiandaoNum)
            {
                if(canSign)
                {
                    box.active = false;
                    mask.active = false;
                    //award.node.color = cc.color(196,124,30);
                    //desc.color = cc.color(196,124,30);
                }
            }
            else if(dayNum<qiandaoNum)
            {
                box.active = true;
                mask.active = true;
                award.string = "已领取";
                //award.node.color = cc.color(124,121,114);
                //desc.color = cc.color(124,121,114);
            }
            else
            {
                box.active = true;
                mask.active = false;
                //award.node.color = cc.color(196,124,30);
                //desc.color = cc.color(124,121,114);
            }
        }

        this.btn_lingqu.interactable = canSign;
        this.btn_lingqu2.interactable = canSign;
        //if(canSign)
        //{
        //    this.btn_lingqu.node.color = this.btn_lingqu.mcolor;
        //    this.btn_lingqu2.node.color = this.btn_lingqu2.mcolor;
        //}
        //else
        //{
        //    this.btn_lingqu.node.color = cc.color(180,180,180);
        //    this.btn_lingqu2.node.color = cc.color(180,180,180);
        //}

        this.btn_lingqu2.node.active = cc.GAME.share;
    },

    lingqu: function(x2)
    {
        var data = cc.config.qiandao[this.qiandaoNum];
        if(data.type == 1 || data.type == 2)
        {
            var award = data.reward;
            if(x2) award *= 2;
            this.game.addCoin(award);
        }
        if(data.type == 2 || data.type == 3)
        {
            var playerId = data.playerId;
            storage.addHasPlayer(playerId);
            storage.uploadHasPlayer();
        }

        storage.setQianDaoNum((this.qiandaoNum+1));
        storage.uploadQianDaoNum();

        res.showToast("奖牌+"+award);
        this.updateUI();

        // cc.res.showCoinAni();
    },

    show: function(award)
    {
        this.award = award;
        //this.main.wxQuanState(false);
        this.game = cc.find("Canvas").getComponent("main");
        this.node.sc = this;
        this.initUI();
        this.updateUI();

        this.node.active = true;
        this.bg.runAction(cc.sequence(
                cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
                cc.scaleTo(0.2,1).easing(cc.easeSineOut())
            ));
        cc.sdk.showBanner();

    },

    hide: function()
    {
        this.game.updateRed();
        //this.main.wxQuanState(true);
        var self = this;
        this.bg.runAction(cc.sequence(
                cc.scaleTo(0.2,1.1).easing(cc.easeSineOut()),
                cc.scaleTo(0.2,0).easing(cc.easeSineOut()),
                cc.callFunc(function(){
                    self.node.destroy();
                })
            ));
        cc.sdk.hideBanner();
    },

    click: function(event,data)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "lingqu")
        {
            this.lingqu();
        }
        else if(data == "lingqu2")
        {
            var self = this;
            cc.sdk.share(function(r){
                if(r)
                {
                    self.lingqu(true);
                }
            },"qiandao");

        }
        storage.playSound(res.audio_button);
        cc.log(data);
    }

    
});
