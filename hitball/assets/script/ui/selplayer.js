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
        this.btn_last = cc.find("last",this.node);
        this.btn_next = cc.find("next",this.node);

        this.node_pages = cc.find("pages",this.node);
        this.pages = this.node_pages.children;

        this.index = 1;
        this.pageNum = this.pages.length;

        this.updateCurrPage();
    },

    updateUI: function()
    {
        this.btn_last.active = this.index == 1 ? false : true;
        this.btn_next.active = this.index == this.pageNum ? false : true;
    },

    initPagesPos: function()
    {
        for(var i=0;i<this.pages.length;i++)
        {
            this.pages[i].x = cc.winSize.width*i;
        }
    },

    updateCurrPage: function()
    {
        var ids = cc.config.pagesPlayerIds[this.index-1];
        var page = this.pages[this.index-1];
        for(var i=0;i<ids.length;i++)
        {
            var id = ids[i];
            var player = cc.find("player"+id,page);
            player.playerId = id;
            if(!storage.isHasPlayer(id))
            {
                player.color = cc.color(0,0,0);
                var ps = player.children;
                for(var j=0;j<ps.length;j++)
                {
                    ps[j].color = cc.color(0,0,0);
                }
            }
        }
    },

    next: function()
    {
        var self = this;
        if(this.index<this.pageNum && !this.scroll)
        {
            this.index ++;
            this.updateCurrPage();
            this.scroll = true;
            this.node_pages.runAction(cc.sequence(
                cc.moveBy(0.5,-cc.winSize.width,0).easing(cc.easeSineIn()),
                cc.callFunc(function(){
                    self.scroll = false;
                    self.updateUI();
                })
            ));
        }
    },

    last: function()
    {
        var self = this;
        if(this.index>1 && !this.scroll)
        {
            this.index --;
            this.scroll = true;
            this.node_pages.runAction(cc.sequence(
                cc.moveBy(0.5,cc.winSize.width,0).easing(cc.easeSineIn()),
                cc.callFunc(function(){
                    self.scroll = false;
                    self.updateUI();
                })
            ));
        }
    },

    sel: function(id)
    {
        if(storage.isHasPlayer(id))
        {
            storage.setPlayer(id);
            this.game.updatePlayer();

            this.hide();
        }
        else
        {
            storage.setPlayer(id);
            this.game.updatePlayer();

            this.hide();
        }
    },

    show: function()
    {
        this.game = cc.find("Canvas").getComponent("main");
        this.node.sc = this;
        this.initUI();
        this.updateUI();

        var self = this;
        this.node.x = cc.winSize.width;
        this.node.active = true;
        this.node.opacity = 0;
        this.node.runAction(cc.sequence(
            cc.moveBy(0,cc.v2(cc.winSize.width,0)),
            cc.callFunc(function(){
                self.initPagesPos();
            }),
            cc.fadeIn(0),
            cc.moveBy(0.5,-cc.winSize.width,0).easing(cc.easeSineIn()),
            cc.callFunc(function(){

            })
        ));

        this.game.node_main.runAction(
            cc.moveBy(0.5,-cc.winSize.width,0).easing(cc.easeSineIn())
        );
        //storage.playSound(res.audio_win);
    },


    hide: function()
    {
        var self = this;
        this.node.runAction(cc.sequence(
                cc.moveBy(0.5,cc.winSize.width,0).easing(cc.easeSineIn()),
                cc.callFunc(function(){
                    self.node.destroy();
                })
            ));
        this.game.node_main.runAction(
            cc.moveBy(0.5,cc.winSize.width,0).easing(cc.easeSineIn())
        );

        for(var i=1;i<this.index;i++)
        {
            this.pages[i-1].active = false;
        }
    },

    click: function(event,data)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "next")
        {
            this.next();
        }
        else if(data == "last")
        {
            this.last();
        }
        else if(data == "sel")
        {
            this.sel(event.target.playerId);
        }

        storage.playSound(res.audio_button);
        cc.log(data);
    }

    
});
